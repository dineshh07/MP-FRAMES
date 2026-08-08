import { db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = 0;

cart.forEach(item => {
    total += Number(item.price) * (item.quantity || 1);
});

document.getElementById("total").innerText = total;


// ================================
// LOAD RAZORPAY
// ================================

function loadRazorpay() {

    return new Promise((resolve, reject) => {

        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => resolve(true);

        script.onerror = () => {
            reject(new Error("Razorpay failed to load"));
        };

        document.head.appendChild(script);
    });
}


// ================================
// UPLOAD PHOTO
// ================================

async function uploadPhoto() {

    const file =
        document.getElementById("photo").files[0];

    if (!file) {
        alert("Please upload a photo.");
        return "";
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Only JPG and PNG images are allowed.");
        return "";
    }

    if (file.size > 10 * 1024 * 1024) {
        alert("Maximum file size is 10MB.");
        return "";
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "mpframes");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/dqavm3wk/image/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!data.secure_url) {
        throw new Error("Photo upload failed");
    }

    return data.secure_url;
}


// ================================
// CREATE RAZORPAY ORDER
// ================================

async function createRazorpayOrder() {

    const response = await fetch(
        "/api/create-order",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                amount: total
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Unable to create payment order"
        );
    }

    return data;
}


// ================================
// VERIFY PAYMENT
// ================================

async function verifyPayment(paymentResponse) {

    const response = await fetch(
        "/api/verify-payment",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(paymentResponse)
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.error || "Payment verification failed"
        );
    }

    return data;
}


// ================================
// SAVE ORDER TO FIREBASE
// ================================

async function saveOrders(
    name,
    phone,
    address,
    photoUrl,
    paymentId,
    razorpayOrderId
) {

    for (const item of cart) {

        await addDoc(
            collection(db, "orders"),
            {

                customerName: name,

                phone: phone,

                address: address,

                frameName: item.name,

                category: item.category || "",

                quantity: item.quantity || 1,

                price: Number(item.price),

                message: "",

                photo: photoUrl,

                status: "Paid",

                paymentStatus: "Paid",

                paymentId: paymentId,

                razorpayOrderId: razorpayOrderId,

                createdAt: new Date()
            }
        );
    }
}


// ================================
// WHATSAPP
// ================================

function sendWhatsApp(
    name,
    phone,
    address,
    paymentId
) {

    let products = "";

    cart.forEach(item => {

        products +=
            `• ${item.name} x ${item.quantity || 1} - ₹${Number(item.price) * (item.quantity || 1)}\n`;

    });

    const whatsapp = `🛒 *NEW ORDER - MP FRAMES*

👤 Name : ${name}

📱 Phone : ${phone}

📍 Address :
${address}

🖼️ Products :
${products}

💰 Total : ₹${total}

💳 Payment : Paid ✅

🧾 Payment ID : ${paymentId}`;


    const whatsappUrl =
        "https://wa.me/918220798492?text=" +
        encodeURIComponent(whatsapp);


    /*
       IMPORTANT:
       Use location.href instead of window.open().
       This avoids popup blocking after Razorpay payment.
    */

    window.location.href = whatsappUrl;
}


// ================================
// PLACE ORDER
// ================================

window.placeOrder = async function () {

    try {

        const name =
            document.getElementById("name")
                .value
                .trim();

        const phone =
            document.getElementById("phone")
                .value
                .trim();

        const address =
            document.getElementById("address")
                .value
                .trim();


        if (!name || !phone || !address) {

            alert("Fill all details");

            return;
        }


        if (cart.length === 0) {

            alert("Cart is empty");

            return;
        }


        const button =
            document.querySelector(
                ".checkout button"
            );


        if (button) {

            button.disabled = true;

            button.innerText =
                "Processing Payment...";
        }


        // Load Razorpay

        await loadRazorpay();


        // Upload customer photo

        const photoUrl =
            await uploadPhoto();


        // Create Razorpay order

        const razorpayOrder =
            await createRazorpayOrder();


        // ================================
        // RAZORPAY OPTIONS
        // ================================

        const options = {

            key: razorpayOrder.keyId,

            amount: razorpayOrder.amount,

            currency: razorpayOrder.currency,

            name: "MP Frames",

            description: "Photo Frame Order",

            order_id: razorpayOrder.orderId,


            handler: async function (response) {

                try {

                    // Verify payment

                    const verification =
                        await verifyPayment(response);


                    // Save order to Firebase

                    await saveOrders(
                        name,
                        phone,
                        address,
                        photoUrl,
                        verification.paymentId,
                        verification.orderId
                    );


                    // ================================
                    // WHATSAPP
                    // ================================

                    sendWhatsApp(
                        name,
                        phone,
                        address,
                        verification.paymentId
                    );


                    // NOTE:
                    // Do NOT clear cart before WhatsApp.
                    // WhatsApp URL is opened first.


                } catch (error) {

                    console.error(
                        "Order error:",
                        error
                    );

                    alert(
                        "Payment received, but order verification failed. Please contact MP Frames."
                    );


                    if (button) {

                        button.disabled = false;

                        button.innerText =
                            "Place Order";
                    }
                }
            },


            modal: {

                ondismiss: function () {

                    if (button) {

                        button.disabled = false;

                        button.innerText =
                            "Place Order";
                    }

                    alert(
                        "Payment cancelled."
                    );
                }
            },


            prefill: {

                name: name,

                contact: phone
            },


            notes: {

                address: address
            },


            theme: {

                color: "#000000"
            }
        };


        const razorpay =
            new Razorpay(options);


        razorpay.on(
            "payment.failed",
            function (response) {

                console.error(
                    response.error
                );


                alert(
                    "Payment failed. Please try again."
                );


                if (button) {

                    button.disabled = false;

                    button.innerText =
                        "Place Order";
                }
            }
        );


        razorpay.open();


    } catch (error) {

        console.error(error);


        alert(
            error.message ||
            "Something went wrong. Please try again."
        );


        const button =
            document.querySelector(
                ".checkout button"
            );


        if (button) {

            button.disabled = false;

            button.innerText =
                "Place Order";
        }
    }
};
