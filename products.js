import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const container = document.getElementById("product-container");
const search = document.getElementById("search");
const filter = document.getElementById("filter");

let products = [];

// Load Products
async function loadProducts() {

    if (!container) return;

    products = [];

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((doc) => {

        products.push({
            id: doc.id,
            ...doc.data()
        });

    });

    displayProducts(products);
}

// Display Products
function displayProducts(list) {

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML = "<h2>No Products Found</h2>";
        return;

    }

    list.forEach((product) => {

        container.innerHTML += `
        <div class="product">

            <img src="${product.image}" alt="${product.name}">

            <div class="product-content">

                <h3>${product.name}</h3>

                <p><b>Category:</b> ${product.category || "Not Available"}</p>

                <p class="price">₹${product.price}</p>

                <button class="view"
                onclick='viewProduct(${JSON.stringify(product)})'>
                View Details
                </button>

                <button class="cart"
                onclick='addToCart(${JSON.stringify(product)})'>
                Add To Cart
                </button>

            </div>

        </div>
        `;

    });

}

// Search + Filter
function filterProducts() {

    const searchText = search ? search.value.toLowerCase() : "";

    const category = filter ? filter.value : "All";

    const filtered = products.filter((product) => {

        const matchName = product.name
            .toLowerCase()
            .includes(searchText);

        const matchCategory =
            category === "All" ||
            product.category === category;

        return matchName && matchCategory;

    });

    displayProducts(filtered);

}

// Only add listeners if elements exist
if (search) {
    search.addEventListener("input", filterProducts);
}

if (filter) {
    filter.addEventListener("change", filterProducts);
}

// View Product
window.viewProduct = function (product) {

    localStorage.setItem(
        "selectedProduct",
        JSON.stringify(product)
    );

    window.location.href = "product.html";

};

// Add To Cart
window.addToCart = function (product) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === product.id);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    alert("Product Added To Cart");

};

// Update Cart Count
function updateCartCount() {

    const cartCount = document.getElementById("cart-count");

    if (cartCount) {

        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        cartCount.innerText = cart.length;

    }

}

updateCartCount();

loadProducts();