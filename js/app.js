// Global State
const state = {
    currentUser: null,
    currentPage: "home",
    properties: [],
    propertyTypes: [],
    selectedProperty: null
};

// Initialize
document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {

    const userData = localStorage.getItem("currentUser");

    if (userData) {
        state.currentUser = JSON.parse(userData);
        updateNavigation();
    }

    await loadPropertyTypes();
    await loadFeaturedProperties();
    await loadAllProperties();

    setupEventListeners();
    showPage("home");
}

// ---------------- EVENTS ----------------

function setupEventListeners() {

    const userBtn = document.getElementById("userBtn");
    const userDropdown = document.getElementById("userDropdown");

    if (userBtn) {
        userBtn.addEventListener("click", e => {
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        });
    }

    document.addEventListener("click", () => {
        if (userDropdown) userDropdown.classList.remove("show");
    });

    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    if (navToggle) {
        navToggle.addEventListener("click", () => {
            navMenu.style.display =
                navMenu.style.display === "flex" ? "none" : "flex";
        });
    }
}

// ---------------- PROPERTY TYPES ----------------

async function loadPropertyTypes() {

    try {

        const response = await fetch("/property-types");

        const data = await response.json();

        state.propertyTypes = data;

        const filter = document.getElementById("propertyTypeFilter");

        if (filter) {

            filter.innerHTML =
                '<option value="">All Property Types</option>';

            data.forEach(type => {

                const option = document.createElement("option");

                option.value = type.id;
                option.textContent = type.name;

                filter.appendChild(option);

            });
        }

    } catch (error) {

        console.error("Error loading property types:", error);

    }
}

// ---------------- FEATURED PROPERTIES ----------------

async function loadFeaturedProperties() {

    try {

        const response = await fetch("/properties");

        const properties = await response.json();

        const featured = properties.filter(
            p => p.featured === 1 && p.status === "available"
        );

        displayFeaturedProperties(featured.slice(0, 3));

    } catch (error) {

        console.error("Error loading featured properties:", error);

    }
}

// ---------------- ALL PROPERTIES ----------------

async function loadAllProperties() {

    try {

        const response = await fetch("/properties");

        const properties = await response.json();

        state.properties = properties.filter(
            p => p.status === "available"
        );

        displayAllProperties(state.properties);

    } catch (error) {

        console.error("Error loading properties:", error);

    }
}

// ---------------- DISPLAY FUNCTIONS ----------------

function displayFeaturedProperties(properties) {

    const container = document.getElementById("featuredProperties");

    if (!container) return;

    container.innerHTML = properties
        .map(p => createPropertyCard(p))
        .join("");

}

function displayAllProperties(properties) {

    const container = document.getElementById("allProperties");

    if (!container) return;

    if (properties.length === 0) {

        container.innerHTML =
            "<p style='text-align:center;padding:2rem'>No properties found</p>";

        return;

    }

    container.innerHTML = properties
        .map(p => createPropertyCard(p))
        .join("");

}

function createPropertyCard(property) {

    const image =
        property.images && property.images.length
            ? property.images[0]
            : "https://via.placeholder.com/400x300";

    return `

    <div class="property-card" onclick="viewPropertyDetail('${property.id}')">

        <img src="${image}" class="property-image">

        <div class="property-content">

            <h3>${property.title}</h3>

            <p>${property.city}, ${property.state}</p>

            <div class="property-price">
            ₹${property.amount.toLocaleString("en-IN")}
            </div>

        </div>

    </div>

    `;

}

// ---------------- PROPERTY DETAIL ----------------

async function viewPropertyDetail(propertyId) {

    try {

        const response = await fetch(`/properties/${propertyId}`);

        const property = await response.json();

        state.selectedProperty = property;

        showPage("propertyDetail");

        displayPropertyDetail(property);

    } catch (error) {

        console.error("Error loading property detail:", error);

    }
}

function displayPropertyDetail(property) {

    const container = document.getElementById("propertyDetailContent");

    if (!container) return;

    container.innerHTML = `

    <h2>${property.title}</h2>

    <p>${property.address}</p>

    <p>₹${property.amount}</p>

    <p>${property.description}</p>

    `;

}

// ---------------- NAVIGATION ----------------

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageName + "Page");

    if (page) {
        page.classList.add("active");
        state.currentPage = pageName;
    }

    window.scrollTo(0, 0);
}

// ---------------- NAV UPDATE ----------------

function updateNavigation() {

    const visitorNav = document.querySelectorAll(".visitor-nav");
    const userNav = document.querySelectorAll(".user-nav");

    if (state.currentUser) {

        visitorNav.forEach(el => (el.style.display = "none"));
        userNav.forEach(el => (el.style.display = "flex"));

        document.getElementById("navUserName").textContent =
            state.currentUser.name;

    } else {

        visitorNav.forEach(el => (el.style.display = "flex"));
        userNav.forEach(el => (el.style.display = "none"));

    }

}