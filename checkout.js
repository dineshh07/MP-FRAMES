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

async function uploadPhoto() {

    const file = document.getElementById("photo").files[0];

    if (!file) return "";

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

        await addDoc(collection(db, "orders"), {

            customerName: name,
            phone: phone,
            address: address,

            frameName: item.name,
            category: item.category || "",

            quantity: item.quantity || 1,

            price: item.price,

            message: "",

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
        "https://wa.me/6382667556?text=" +
        encodeURIComponent(whatsapp),
        "_blank"
    );

    localStorage.removeItem("cart");

    alert("Order Placed Successfully");

    location.href = "index.html";
}
