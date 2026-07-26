import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const table = document.getElementById("ordersTable");

async function loadOrders() {

    console.log("Loading orders...");

    const snapshot = await getDocs(collection(db, "orders"));

    console.log("Documents:", snapshot.size);

    table.innerHTML = "";

    snapshot.forEach((doc) => {

        console.log(doc.data());

        const order = doc.data();

        table.innerHTML += `
        <tr>
            <td>${order.customerName}</td>
            <td>${order.phone}</td>
            <td>${order.address}</td>
            <td>${order.frameName}</td>
            <td>${order.message}</td>
            <td>${order.quantity}</td>
            <td>₹${order.price}</td>
            <td>${order.status}</td>
        </tr>`;
    });
}

loadOrders();
