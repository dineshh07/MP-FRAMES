import { db } from "./firebase.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = 0;

cart.forEach(item => {
    total += item.price * (item.quantity || 1);
});

document.getElementById("total").innerText = total;

// Upload Photo to Cloudinary
async function uploadPhoto() {

    const file = document.getElementById("photo").files[0];

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

    return data.secure_url;
}

// Place Order
window.placeOrder = async function () {

    let name = document.getElementById("name").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let address = document.getElementById("address").value.trim();

    if (!name || !phone || !address) {
        alert("Fill all details");
        return;
    }

    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    // Upload customer photo
    const photoUrl = await uploadPhoto();

    for (const item of cart) {

        await addDoc(collection(db, "orders"), {

            customerName: name,
            phone: phone,
            address: address,

            frameName: item.name,
            category: item.category || "",

            quantity: item.quantity || 1,

            price: item.price,

            message: "",

            photo: photoUrl,

            status: "Pending",

            createdAt: new Date()

        });

    }

    let whatsapp = `🛒 New Order

Name : ${name}

Phone : ${phone}

Address : ${address}

Total : ₹${total}`;

    window.open(
        "https://wa.me/+918220798492?text=" +
        encodeURIComponent(whatsapp),
        "_blank"
    );

    localStorage.removeItem("cart");

    alert("Order Placed Successfully");

    location.href = "index.html";
};
