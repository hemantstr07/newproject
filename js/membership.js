// Membership Management

let membershipPlans = [];
let membershipStatus = null;


/* --------------------------------
   Load Membership Plans
-------------------------------- */

async function loadMembershipPlans() {

    try {

        const response = await fetch("/memberships");

        if (!response.ok) {
            throw new Error("Failed to load membership plans");
        }

        const text = await response.text();
        membershipPlans = JSON.parse(text);

        return membershipPlans;

    } catch (error) {

        console.error("Membership plans error:", error);

        showToast("Error loading membership plans", "error");

        return [];
    }
}


/* --------------------------------
   Get Membership Status
-------------------------------- */

async function getMembershipStatus(userId) {

    try {

        const response =
            await fetch(`/memberships/status/${userId}`);

        if (!response.ok) {
            throw new Error("Failed to fetch membership status");
        }

        const text = await response.text();

        membershipStatus = JSON.parse(text);

        return membershipStatus;

    } catch (error) {

        console.error("Membership status error:", error);

        showToast("Error loading membership status", "error");

        return null;
    }
}


/* --------------------------------
   Load Membership Page
-------------------------------- */

async function loadMembershipPage() {

    try {

        showLoading();

        updateSidebarActive(event?.target);

        await loadMembershipPlans();

        const status =
            await getMembershipStatus(state.currentUser.id);

        if (!status) {
            showToast("Error loading membership data", "error");
            return;
        }

        const isExpired = status.is_expired;

        const currentPlanName =
            status.plan_details
                ? status.plan_details.name
                : "Free Plan";

        const expiryDate =
            status.membership_expiry
                ? new Date(status.membership_expiry)
                    .toLocaleDateString("en-IN")
                : "Never";

        const content = `

        <div class="dashboard-header">
            <h1>Membership Management</h1>
            <p>Manage your subscription and property limits</p>
        </div>

        <div class="membership-status-card">

            <div class="membership-status-header">

                <h2>Current Membership</h2>

                ${isExpired
                    ? `<span class="badge badge-danger">Expired</span>`
                    : `<span class="badge badge-success">Active</span>`}

            </div>

            <div class="membership-status-body">

                <div class="membership-stat">
                    <h3>${currentPlanName}</h3>
                    <p>Current Plan</p>
                </div>

                <div class="membership-stat">
                    <h3>${status.property_count} / ${status.property_limit}</h3>
                    <p>Properties Listed</p>
                </div>

                <div class="membership-stat">
                    <h3>${expiryDate}</h3>
                    <p>Expires On</p>
                </div>

                <div class="membership-stat">
                    <h3>${status.remaining_slots}</h3>
                    <p>Available Slots</p>
                </div>

            </div>

        </div>


        <div class="membership-plans-grid">

        ${membershipPlans.map(plan => {

            const isCurrent =
                status.membership_type === plan.id;

            return `

            <div class="membership-plan-card">

                <h3>${plan.name}</h3>

                <div class="plan-price">
                    ₹${plan.price.toLocaleString("en-IN")} / year
                </div>

                <p>${plan.description}</p>

                <div>
                    ${plan.property_limit} Properties
                </div>

                ${isCurrent
                    ? `<button class="btn-outline" disabled>Current Plan</button>`
                    : `<button class="btn-primary"
                        onclick="purchaseMembership('${plan.id}',${plan.price},'${plan.name}')">
                        Purchase
                       </button>`}

            </div>

            `;

        }).join("")}

        </div>

        `;

        document.getElementById("dashboardContent").innerHTML = content;

    } catch (error) {

        console.error("Membership page error:", error);

        showToast("Error loading membership page", "error");

    } finally {

        hideLoading();

    }
}


/* --------------------------------
   Purchase Membership
-------------------------------- */

async function purchaseMembership(planId, amount, planName) {

    try {

        showLoading();

        const orderResponse =
            await fetch("/razorpay/create-order", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    amount: amount * 100,
                    currency: "INR",

                    receipt:
                        `membership_${planId}_${Date.now()}`,

                    notes: {
                        type: "membership",
                        plan_id: planId,
                        user_id: state.currentUser.id
                    }

                })

            });

        if (!orderResponse.ok) {
            throw new Error("Failed to create payment order");
        }

        const orderData = await orderResponse.json();

        if (!orderData.id) {
            throw new Error("Invalid Razorpay order");
        }


        const options = {

            key: RAZORPAY_CONFIG.KEY_ID,

            amount: amount * 100,

            currency: "INR",

            name: "Narmada Sales",

            description: `${planName} Membership`,

            order_id: orderData.id,

            handler: async function(response) {

                await handleMembershipPaymentSuccess(

                    planId,

                    response.razorpay_payment_id,

                    response.razorpay_order_id,

                    response.razorpay_signature

                );

            },

            prefill: {

                name: state.currentUser.name,

                email: state.currentUser.email,

                contact: state.currentUser.phone || ""

            },

            theme: {
                color: "#d4a574"
            }

        };

        const razorpay = new Razorpay(options);

        razorpay.open();

    } catch (error) {

        console.error("Membership purchase error:", error);

        showToast("Error initiating payment", "error");

    } finally {

        hideLoading();

    }
}


/* --------------------------------
   Handle Payment Success
-------------------------------- */

async function handleMembershipPaymentSuccess(

    planId,
    paymentId,
    orderId,
    signature

) {

    try {

        showLoading();

        const response =
            await fetch("/memberships/purchase", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    userId: state.currentUser.id,

                    planId: planId,

                    razorpayPaymentId: paymentId

                })

            });

        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(
                errorData.message ||
                "Failed to upgrade membership"
            );

        }

        const result = await response.json();

        state.currentUser.membership_type = planId;

        state.currentUser.property_limit =
            result.membership.property_limit;

        state.currentUser.membership_expiry =
            result.membership.expires_at;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(state.currentUser)
        );

        showToast(
            "Membership upgraded successfully!",
            "success"
        );

        await loadMembershipPage();

    } catch (error) {

        console.error("Membership upgrade error:", error);

        showToast(error.message, "error");

    } finally {

        hideLoading();

    }
}


/* --------------------------------
   Property Limit Check
-------------------------------- */

async function checkPropertyLimitBeforeAdd() {

    try {

        const status =
            await getMembershipStatus(state.currentUser.id);

        if (!status) return false;

        if (status.is_expired) {

            showToast(
                "Membership expired. Please upgrade.",
                "error"
            );

            loadMembershipPage();

            return false;
        }

        if (status.remaining_slots <= 0) {

            showToast(
                "Property limit reached. Upgrade membership.",
                "error"
            );

            loadMembershipPage();

            return false;
        }

        return true;

    } catch (error) {

        console.error("Membership check error:", error);

        return true;

    }
}