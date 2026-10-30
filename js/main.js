/* =========================================================
   North Star Bakery - main.js
   Touchstone 4: Interactivity and Client-Side Data

   1. Menu favorites + category filter (products.html)
   2. Contact form validation (contact.html)
   3. localStorage helpers used by both pages
   ========================================================= */

/* ---------- Data ---------- */

// Object: the localStorage keys used across the site
const STORAGE_KEYS = {
    favorites: "nsb-favorites",
    category: "nsb-menu-category",
    contact: "nsb-contact-info"
};

// Object: display labels for each menu category
const CATEGORY_LABELS = {
    all: "All Items",
    breads: "Breads",
    pastries: "Pastries",
    cakes: "Cakes"
};

// Array of objects: the bakery menu (prices fall inside the ranges on the page)
const products = [
    { id: "signature-loaf", name: "Signature Loaf", category: "breads", price: 12, description: "Our handcrafted house favorite with a crisp crust." },
    { id: "sourdough", name: "Country Sourdough", category: "breads", price: 9, description: "Slow-fermented loaf with a tangy, chewy crumb." },
    { id: "baguette", name: "French Baguette", category: "breads", price: 5, description: "Golden, crusty, and baked fresh every morning." },
    { id: "croissant", name: "Butter Croissant", category: "pastries", price: 4, description: "Flaky, buttery layers made by hand." },
    { id: "cinnamon-roll", name: "Cinnamon Roll", category: "pastries", price: 5, description: "Soft swirl topped with vanilla glaze." },
    { id: "fruit-danish", name: "Seasonal Fruit Danish", category: "pastries", price: 6, description: "Rotating fruit filling on a flaky pastry base." },
    { id: "chocolate-cake", name: "Chocolate Layer Cake", category: "cakes", price: 45, description: "Rich chocolate layers for birthdays and gatherings." },
    { id: "vanilla-cake", name: "Vanilla Celebration Cake", category: "cakes", price: 40, description: "Light vanilla sponge with buttercream frosting." },
    { id: "carrot-cake", name: "Carrot Cake", category: "cakes", price: 35, description: "Spiced carrot cake with cream cheese frosting." }
];

/* ---------- Storage helpers ---------- */

// Read a JSON value from localStorage, returning a fallback if missing or broken
function loadFromStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
    } catch (error) {
        return fallback;
    }
}

// Save any value to localStorage as JSON text
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Storage may be blocked (e.g., private mode); the page still works without it
    }
}

// Array of favorite product ids, restored from the last visit
let favorites = loadFromStorage(STORAGE_KEYS.favorites, []);

// Look up a product object by its id
function findProduct(id) {
    return products.find(function (product) {
        return product.id === id;
    });
}

// Return only the favorites that still match a product on the menu
function getFavoriteProducts() {
    return favorites.map(findProduct).filter(Boolean);
}

/* =========================================================
   1. MENU FAVORITES + CATEGORY FILTER (products.html)
   ========================================================= */

function isFavorite(id) {
    return favorites.includes(id);
}

// Add or remove an item from favorites, save, and refresh the page
function toggleFavorite(id) {
    if (isFavorite(id)) {
        favorites = favorites.filter(function (favId) {
            return favId !== id;
        });
    } else {
        favorites.push(id);
    }
    saveToStorage(STORAGE_KEYS.favorites, favorites);
    renderProducts(getCurrentCategory());
    renderFavorites();
}

function clearFavorites() {
    favorites = [];
    saveToStorage(STORAGE_KEYS.favorites, favorites);
    renderProducts(getCurrentCategory());
    renderFavorites();
}

function getCurrentCategory() {
    return loadFromStorage(STORAGE_KEYS.category, "all");
}

// Build the HTML for one product card
function createProductCard(product) {
    const saved = isFavorite(product.id);
    const item = document.createElement("li");
    item.className = "product-card" + (saved ? " is-favorite" : "");
    item.innerHTML =
        '<p class="product-category">' + CATEGORY_LABELS[product.category] + "</p>" +
        "<h3>" + product.name + "</h3>" +
        "<p>" + product.description + "</p>" +
        '<p class="price">$' + product.price + "</p>" +
        '<button type="button" class="favorite-button" data-id="' + product.id + '" aria-pressed="' + saved + '">' +
        (saved ? "&#9733; Saved to Favorites" : "&#9734; Save to Favorites") +
        "</button>";
    return item;
}

// Show only the products in the selected category
function renderProducts(category) {
    const list = document.getElementById("product-list");
    const status = document.getElementById("filter-status");
    const visible = products.filter(function (product) {
        return category === "all" || product.category === category;
    });

    list.innerHTML = "";
    visible.forEach(function (product) {
        list.appendChild(createProductCard(product));
    });

    status.textContent = "Showing " + visible.length + " " +
        (category === "all" ? "items" : CATEGORY_LABELS[category].toLowerCase()) + ".";
}

// Highlight the active filter button
function updateFilterButtons(category) {
    document.querySelectorAll(".filter-button").forEach(function (button) {
        const active = button.dataset.category === category;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active);
    });
}

function selectCategory(category) {
    saveToStorage(STORAGE_KEYS.category, category);
    updateFilterButtons(category);
    renderProducts(category);
}

// Rebuild the "My Favorites" panel and its running total
function renderFavorites() {
    const list = document.getElementById("favorites-list");
    const count = document.getElementById("favorites-count");
    const empty = document.getElementById("favorites-empty");
    const total = document.getElementById("favorites-total");
    const saved = getFavoriteProducts();

    list.innerHTML = "";
    saved.forEach(function (product) {
        const item = document.createElement("li");
        item.textContent = product.name + " - $" + product.price;
        list.appendChild(item);
    });

    const sum = saved.reduce(function (runningTotal, product) {
        return runningTotal + product.price;
    }, 0);

    count.textContent = saved.length;
    total.textContent = saved.length ? "Estimated total: $" + sum : "";
    empty.hidden = saved.length > 0;
}

function initMenuFavorites() {
    const list = document.getElementById("product-list");
    if (!list) {
        return; // Not on the products page
    }

    document.querySelectorAll(".filter-button").forEach(function (button) {
        button.addEventListener("click", function () {
            selectCategory(button.dataset.category);
        });
    });

    // One listener handles every "Save to Favorites" button (event delegation)
    list.addEventListener("click", function (event) {
        const button = event.target.closest(".favorite-button");
        if (button) {
            toggleFavorite(button.dataset.id);
        }
    });

    document.getElementById("clear-favorites").addEventListener("click", clearFavorites);

    // Restore the last selected category and saved favorites
    const category = getCurrentCategory();
    updateFilterButtons(category);
    renderProducts(category);
    renderFavorites();
}

/* =========================================================
   2. CONTACT FORM VALIDATION (contact.html)
   ========================================================= */

// Format a Date as YYYY-MM-DD in the user's local time
function toDateInputValue(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
}

function getTomorrowValue() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toDateInputValue(tomorrow);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Object: one validation function per field id. Each returns an error message or "".
const validationRules = {
    "name": function (value) {
        if (value === "") return "Please enter your name.";
        if (value.length < 2) return "Name must be at least 2 characters.";
        return "";
    },
    "email": function (value) {
        if (value === "") return "Please enter your email address.";
        if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email address, such as name@example.com.";
        return "";
    },
    "pickup-date": function (value) {
        if (value === "") return "Please choose a pickup date.";
        // YYYY-MM-DD strings compare correctly as text
        if (value < getTomorrowValue()) return "Pickup date must be at least one day from today so we can bake your order.";
        return "";
    },
    "request-type": function (value) {
        if (value === "") return "Please select a request type.";
        return "";
    },
    "item-details": function (value) {
        if (value === "") return "Please describe the items you would like.";
        if (value.length < 10) return "Item details must be at least 10 characters so we understand your request.";
        if (value.length > 500) return "Item details must be 500 characters or fewer.";
        return "";
    },
    "allergy-notes": function (value) {
        if (value.length > 300) return "Allergy notes must be 300 characters or fewer.";
        return "";
    }
};

// Show or clear the message under one field
function showFieldError(field, message) {
    const errorElement = document.getElementById(field.id + "-error");
    errorElement.textContent = message;
    field.classList.toggle("invalid", message !== "");
    field.setAttribute("aria-invalid", message !== "");
}

// Validate one field using its rule; returns true when valid
function validateField(field) {
    const rule = validationRules[field.id];
    const message = rule ? rule(field.value.trim()) : "";
    showFieldError(field, message);
    return message === "";
}

// Validate every field; returns the first invalid field (or null)
function validateForm(form) {
    let firstInvalid = null;
    Object.keys(validationRules).forEach(function (id) {
        const field = form.elements[id];
        if (!validateField(field) && !firstInvalid) {
            firstInvalid = field;
        }
    });
    return firstInvalid;
}

function showFormStatus(message, type) {
    const status = document.getElementById("form-status");
    status.textContent = message;
    status.className = "form-status " + type;
    status.hidden = message === "";
}

// Save name and email only if the user agreed to be remembered
function saveContactInfo(form) {
    if (form.elements["remember-me"].checked) {
        saveToStorage(STORAGE_KEYS.contact, {
            name: form.elements["name"].value.trim(),
            email: form.elements["email"].value.trim()
        });
    } else {
        localStorage.removeItem(STORAGE_KEYS.contact);
    }
}

// Pre-fill name and email from a previous visit
function restoreContactInfo(form) {
    const saved = loadFromStorage(STORAGE_KEYS.contact, null);
    if (saved) {
        form.elements["name"].value = saved.name || "";
        form.elements["email"].value = saved.email || "";
        document.getElementById("welcome-back").textContent =
            "Welcome back, " + saved.name + "! We filled in your contact details.";
        document.getElementById("welcome-back").hidden = false;
    }
}

// Show favorites saved on the Products page and let the user add them to the request
function showSavedFavorites(form) {
    const box = document.getElementById("saved-favorites");
    const saved = getFavoriteProducts();
    if (saved.length === 0) {
        return;
    }

    const names = saved.map(function (product) {
        return product.name;
    });
    document.getElementById("saved-favorites-names").textContent = names.join(", ");
    box.hidden = false;

    document.getElementById("add-favorites").addEventListener("click", function () {
        const details = form.elements["item-details"];
        const line = "Favorites: " + names.join(", ");
        if (!details.value.includes(line)) {
            details.value = details.value.trim() === "" ? line : details.value.trim() + "\n" + line;
        }
        validateField(details);
        details.focus();
    });
}

function handleSubmit(event) {
    event.preventDefault(); // Never send the form until it passes validation
    const form = event.target;
    const firstInvalid = validateForm(form);

    if (firstInvalid) {
        showFormStatus("Please fix the highlighted fields below. Your other entries have been kept.", "error");
        firstInvalid.focus();
        return;
    }

    saveContactInfo(form);
    showFormStatus("Thank you, " + form.elements["name"].value.trim() +
        "! Your request for pickup on " + form.elements["pickup-date"].value +
        " has been received. Our team will email you to confirm.", "success");
}

function initContactForm() {
    const form = document.getElementById("order-form");
    if (!form) {
        return; // Not on the contact page
    }

    form.elements["pickup-date"].min = getTomorrowValue();

    // Re-check a field as soon as the user changes it, so errors clear while typing
    Object.keys(validationRules).forEach(function (id) {
        const field = form.elements[id];
        field.addEventListener("blur", function () {
            if (field.value.trim() !== "" || field.classList.contains("invalid")) {
                validateField(field);
            }
        });
        field.addEventListener("input", function () {
            if (field.classList.contains("invalid")) {
                validateField(field);
            }
        });
    });

    form.addEventListener("submit", handleSubmit);
    restoreContactInfo(form);
    showSavedFavorites(form);
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", function () {
    initMenuFavorites();
    initContactForm();
});
