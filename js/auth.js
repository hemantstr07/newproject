// Authentication Functions

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const role = document.getElementById("loginRole").value;

    try {

        showLoading();

        const response = await fetch("/users");

        const users = await response.json();

        const user = users.find(u =>
            u.email === email &&
            u.password === password &&
            u.role === role &&
            u.status === "active"
        );

        if (user) {

            state.currentUser = user;

            localStorage.setItem(
                "currentUser",
                JSON.stringify(user)
            );

            updateNavigation();

            showPage("dashboard");

            showToast(`Welcome back, ${user.name}!`, "success");

        } else {

            showToast(
                "Invalid email, password, or role",
                "error"
            );

        }

    } catch (error) {

        console.error("Login error:", error);

        showToast(
            "Login failed. Please try again.",
            "error"
        );

    } finally {

        hideLoading();

    }
}

// Register

async function handleRegister(event) {

    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const phone = document.getElementById("registerPhone").value;
    const address = document.getElementById("registerAddress").value;
    const password = document.getElementById("registerPassword").value;
    const role = document.getElementById("registerRole").value;

    try {

        showLoading();

        const usersResponse = await fetch("/users");

        const users = await usersResponse.json();

        const existingUser = users.find(
            u => u.email === email
        );

        if (existingUser) {

            showToast(
                "Email already registered",
                "error"
            );

            return;

        }

        const newUser = {

            id: generateId("user"),

            name,
            email,
            phone,
            address,

            password,
            role,

            status: "active",

            profile_image:
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`

        };

        const createResponse = await fetch("/users", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newUser)

        });

        if (!createResponse.ok) {
            throw new Error("Registration failed");
        }

        const createdUser = await createResponse.json();

        state.currentUser = createdUser;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(createdUser)
        );

        updateNavigation();

        showToast(
            "Registration successful!",
            "success"
        );

        showPage("dashboard");

    } catch (error) {

        console.error("Registration error:", error);

        showToast(
            "Registration failed",
            "error"
        );

    } finally {

        hideLoading();

    }
}

// Booking Modal

function openBookingModal(propertyId) {

    if (!state.currentUser ||
        state.currentUser.role !== "buyer") {

        showToast(
            "Only buyers can book appointments",
            "error"
        );

        return;

    }

    const property = state.selectedProperty;

    const modalContent = `

    <div class="modal-content">

        <div class="modal-header">
            <h2>Book Appointment</h2>
            <button onclick="closeModal()">×</button>
        </div>

        <form onsubmit="handleBooking(event,'${propertyId}','${property.seller_id}')">

            <label>Date & Time</label>

            <input type="datetime-local"
                   id="appointmentDate"
                   required
                   min="${new Date().toISOString().slice(0,16)}">

            <label>Notes</label>

            <textarea id="bookingNotes"></textarea>

            <button type="submit">Confirm Booking</button>

        </form>

    </div>

    `;

    const modal = document.getElementById("modalContainer");

    modal.innerHTML = modalContent;

    modal.classList.add("show");

}

// Booking

async function handleBooking(event, propertyId, sellerId) {

    event.preventDefault();

    const appointmentDate =
        document.getElementById("appointmentDate").value;

    const notes =
        document.getElementById("bookingNotes").value;

    try {

        showLoading();

        const booking = {

            id: generateId("booking"),

            buyer_id: state.currentUser.id,

            property_id: propertyId,

            seller_id: sellerId,

            appointment_date:
                new Date(appointmentDate).toISOString(),

            notes,

            status: "pending"

        };

        const response = await fetch("/bookings", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(booking)

        });

        if (!response.ok) {
            throw new Error("Booking failed");
        }

        showToast(
            "Appointment booked successfully!",
            "success"
        );

        closeModal();

        setTimeout(() => {
            showPage("dashboard");
        }, 1000);

    } catch (error) {

        console.error("Booking error:", error);

        showToast(
            "Failed to book appointment",
            "error"
        );

    } finally {

        hideLoading();

    }

}

// Close modal

function closeModal() {

    const modal =
        document.getElementById("modalContainer");

    modal.classList.remove("show");

    modal.innerHTML = "";

}

// Close modal when clicking outside

document.addEventListener("click", e => {

    const modal =
        document.getElementById("modalContainer");

    if (e.target === modal) {
        closeModal();
    }

});