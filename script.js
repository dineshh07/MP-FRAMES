import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const container = document.getElementById("product-container");
const cartCount = document.getElementById("cart-count");

// ----------------------
// Update Cart Count
// ----------------------
function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cartCount) {

        cartCount.innerText = cart.length;

    }

}

// ----------------------
// Load Featured Products
// ----------------------
async function loadFeaturedProducts() {

    if (!container) return;

    container.innerHTML = "<h2>Loading...</h2>";

    try {

        const snapshot = await getDocs(collection(db, "products"));

        container.innerHTML = "";

        if (snapshot.empty) {

            container.innerHTML = "<h2>No Products Available</h2>";

            return;

        }

        let count = 0;

        snapshot.forEach((doc) => {

            if (count >= 8) return;

            const product = {

                id: doc.id,

                ...doc.data()

            };

            count++;

            container.innerHTML += `

            <div class="product">

                <img src="${product.image}" alt="${product.name}">

                <div class="product-content">

                    <h3>${product.name}</h3>

                    <p><b>Category:</b> ${product.category || "Not Available"}</p>

                    <h2>₹${product.price}</h2>

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

    catch (error) {

        console.error("Firebase Error:", error);

        container.innerHTML = "<h2>Failed To Load Products</h2>";

    }

}

// ----------------------
// View Product
// ----------------------
window.viewProduct = function(product) {

    localStorage.setItem(

        "selectedProduct",

        JSON.stringify(product)

    );

    window.location.href = "product.html";

};

// ----------------------
// Add To Cart
// ----------------------
window.addToCart = function(product) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === product.id);

    if (existing) {

        existing.quantity++;

    }

    else {

        product.quantity = 1;

        cart.push(product);

    }

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    updateCartCount();

    alert("Product Added To Cart");

};

// ----------------------
// Start
// ----------------------
updateCartCount();

loadFeaturedProducts();