import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const table = document.getElementById("ordersTable");

async function loadOrders() {

  table.innerHTML = "";

  const snapshot = await getDocs(collection(db, "orders"));

  snapshot.forEach((document) => {

    const order = document.data();

    table.innerHTML += `
      <tr>

        <td>${order.customerName || ""}</td>

        <td>${order.phone || ""}</td>

        <td>${order.address || ""}</td>

        <td>${order.frameName || ""}</td>

        <td>${order.message || ""}</td>

        <td>
         <td class="photo-box">
${
order.photo
?
`
<a href="${order.photo}" target="_blank">
<img src="${order.photo}">
</a>

<br>

<a href="${order.photo}" target="_blank">
<button class="photo-btn">
🔍 View
</button>
</a>

<a href="${order.photo}" download>
<button class="photo-btn">
⬇ Download
</button>
</a>
`
:
"No Photo"
}
</td>

        <td>
          <select id="status-${document.id}">
            <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Confirmed" ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
            <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
          </select>
        </td>

        <td>
          <button onclick="updateStatus('${document.id}')">
            Update
          </button>
        </td>

      </tr>
    `;

  });

}

window.updateStatus = async function(id) {

  const status = document.getElementById(`status-${id}`).value;

  await updateDoc(doc(db, "orders", id), {
    status: status
  });

  alert("Status Updated");

};

loadOrders();
