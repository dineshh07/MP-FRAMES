import { app, db } from "./firebase.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const auth = getAuth(app);
const productList = document.getElementById("product-list");

// Login Check
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});

// Load Products
async function loadProducts() {

    productList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "products"));

    querySnapshot.forEach((document) => {

        const product = document.data();

        productList.innerHTML += `
        <div class="card">

            <img src="${product.image}" width="150">

            <h3>${product.name}</h3>

            <p><b>Category:</b> ${product.category}</p>

            <p>₹${product.price}</p>

            <button onclick="deleteProduct('${document.id}')">
                Delete
            </button>

        </div>
        `;
    });

}

loadProducts();

// Add Product
window.addProduct = async function () {

    const name = document.getElementById("name").value.trim();
    const price = document.getElementById("price").value.trim();
    const image = document.getElementById("image").value.trim();
    const category = document.getElementById("category").value;

    if (!name || !price || !image || !category) {
        alert("Please fill all fields");
        return;
    }

    await addDoc(collection(db, "products"), {
        name: name,
        price: Number(price),
        image: image,
        category: category
    });

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("image").value = "";
    document.getElementById("category").value = "";

    alert("Product Added");

    loadProducts();

};

// Delete Product
window.deleteProduct = async function (id) {

    if (confirm("Delete this product?")) {

        await deleteDoc(doc(db, "products", id));

        loadProducts();

    }

};

// Logout
window.logout = async function () {

    await signOut(auth);

    window.location.href = "login.html";

};