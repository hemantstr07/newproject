// Dashboard Management - Role-based content loading

async function loadDashboard() {
    if (!state.currentUser) {
        showPage('login');
        return;
    }

    const role = state.currentUser.role;

    if (role === 'admin') {
        loadAdminSidebar();
        await loadAdminDashboard();
    } 
    else if (role === 'buyer') {
        loadBuyerSidebar();
        await loadBuyerDashboard();
    } 
    else if (role === 'seller') {
        loadSellerSidebar();
        await loadSellerDashboard();
    }
}

/* ---------------------------------------------------
   ADMIN DASHBOARD
--------------------------------------------------- */

async function loadAdminDashboard() {

    try {

        showLoading();

        const [usersRes, propertiesRes, bookingsRes, paymentsRes] =
        await Promise.all([
            fetch('/users'),
            fetch('/properties'),
            fetch('/bookings'),
            fetch('/payments')
        ]);

        const users = await usersRes.json();
        const properties = await propertiesRes.json();
        const bookings = await bookingsRes.json();
        const payments = await paymentsRes.json();

        const buyersCount = users.filter(u => u.role === "buyer").length;
        const sellersCount = users.filter(u => u.role === "seller").length;

        const totalRevenue =
            payments.reduce((sum,p)=> sum + (p.amount || 0),0);

        document.getElementById("dashboardContent").innerHTML = `
        <div class="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, ${state.currentUser.name}</p>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <h3>Total Buyers</h3>
                <div class="stat-value">${buyersCount}</div>
            </div>

            <div class="stat-card">
                <h3>Total Sellers</h3>
                <div class="stat-value">${sellersCount}</div>
            </div>

            <div class="stat-card">
                <h3>Total Properties</h3>
                <div class="stat-value">${properties.length}</div>
            </div>

            <div class="stat-card">
                <h3>Total Revenue</h3>
                <div class="stat-value">₹${totalRevenue}</div>
            </div>

        </div>
        `;

    }
    catch(error){

        console.error("Dashboard error:",error);
        showToast("Failed to load dashboard","error");

    }
    finally{

        hideLoading();

    }
}

/* ---------------------------------------------------
   BUYER DASHBOARD
--------------------------------------------------- */

async function loadBuyerDashboard(){

    try{

        showLoading();

        const [bookingsRes,paymentsRes] =
        await Promise.all([
            fetch('/bookings'),
            fetch('/payments')
        ]);

        const bookings = await bookingsRes.json();
        const payments = await paymentsRes.json();

        const myBookings =
            bookings.filter(b=>b.buyer_id===state.currentUser.id);

        const myPayments =
            payments.filter(p=>p.buyer_id===state.currentUser.id);

        document.getElementById("dashboardContent").innerHTML = `
        <div class="dashboard-header">
            <h1>Buyer Dashboard</h1>
            <p>Welcome back ${state.currentUser.name}</p>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <h3>My Bookings</h3>
                <div class="stat-value">${myBookings.length}</div>
            </div>

            <div class="stat-card">
                <h3>Payments</h3>
                <div class="stat-value">${myPayments.length}</div>
            </div>

        </div>
        `;

    }
    catch(error){

        console.error(error);
        showToast("Error loading dashboard","error");

    }
    finally{

        hideLoading();

    }
}

/* ---------------------------------------------------
   SELLER DASHBOARD
--------------------------------------------------- */

async function loadSellerDashboard(){

    try{

        showLoading();

        const [propertiesRes, bookingsRes, paymentsRes] =
        await Promise.all([
            fetch('/properties'),
            fetch('/bookings'),
            fetch('/payments')
        ]);

        const properties = await propertiesRes.json();
        const bookings = await bookingsRes.json();
        const payments = await paymentsRes.json();

        const myProperties =
            properties.filter(p=>p.seller_id===state.currentUser.id);

        const myBookings =
            bookings.filter(b=>b.seller_id===state.currentUser.id);

        const myPayments =
            payments.filter(p=>p.seller_id===state.currentUser.id);

        const totalIncome =
            myPayments.reduce((sum,p)=>sum+p.amount,0);

        document.getElementById("dashboardContent").innerHTML = `

        <div class="dashboard-header">
            <h1>Seller Dashboard</h1>
            <p>Welcome back ${state.currentUser.name}</p>
        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <h3>My Properties</h3>
                <div class="stat-value">${myProperties.length}</div>
            </div>

            <div class="stat-card">
                <h3>Bookings</h3>
                <div class="stat-value">${myBookings.length}</div>
            </div>

            <div class="stat-card">
                <h3>Income</h3>
                <div class="stat-value">₹${totalIncome}</div>
            </div>

        </div>

        `;

    }
    catch(error){

        console.error(error);
        showToast("Error loading dashboard","error");

    }
    finally{

        hideLoading();

    }
}

/* ---------------------------------------------------
   BOOKING UPDATE
--------------------------------------------------- */

async function updateBookingStatus(bookingId,status){

    try{

        showLoading();

        const response =
        await fetch(`/bookings/${bookingId}`,{

            method:"PATCH",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({status})

        });

        if(!response.ok){
            throw new Error("Update failed");
        }

        showToast("Booking updated","success");

        loadPropertyBookings();

    }
    catch(error){

        console.error(error);
        showToast("Error updating booking","error");

    }
    finally{

        hideLoading();

    }
}