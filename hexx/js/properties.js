// Property Management Functions (for Sellers)

/* --------------------------------
   Add Property
-------------------------------- */

async function openAddPropertyModal() {

    const canAdd = await checkPropertyLimitBeforeAdd();

    if (!canAdd) return;

    const modalContent = `
    <div class="modal-content">
        <div class="modal-header">
            <h2>Add New Property</h2>
            <button onclick="closeModal()">×</button>
        </div>

        <form onsubmit="handleAddProperty(event)">

            <input type="text" id="propTitle" placeholder="Title" required>

            <textarea id="propDescription" placeholder="Description" required></textarea>

            <input type="text" id="propAddress" placeholder="Address" required>

            <input type="text" id="propCity" placeholder="City" required>

            <input type="text" id="propState" placeholder="State" required>

            <input type="text" id="propZipcode" placeholder="Zip Code" required>

            <input type="number" id="propAmount" placeholder="Price" required>

            <button type="submit">Add Property</button>

        </form>
    </div>
    `;

    const modal = document.getElementById("modalContainer");

    modal.innerHTML = modalContent;

    modal.classList.add("show");
}



/* --------------------------------
   Submit Property
-------------------------------- */

async function handleAddProperty(event){

    event.preventDefault();

    const property = {

        id: generateId("prop"),

        seller_id: state.currentUser.id,

        title: document.getElementById("propTitle").value,

        description: document.getElementById("propDescription").value,

        address: document.getElementById("propAddress").value,

        city: document.getElementById("propCity").value,

        state: document.getElementById("propState").value,

        zipcode: document.getElementById("propZipcode").value,

        amount: parseFloat(document.getElementById("propAmount").value),

        status: "available"

    };

    try{

        showLoading();

        const response = await fetch("/properties",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(property)

        });

        if(!response.ok){

            throw new Error("Failed to add property");

        }

        showToast("Property added successfully","success");

        closeModal();

        loadDashboard();

    }

    catch(error){

        console.error(error);

        showToast("Error adding property","error");

    }

    finally{

        hideLoading();

    }

}



/* --------------------------------
   Edit Property
-------------------------------- */

function openEditPropertyModal(propertyId){

    fetch(`/properties/${propertyId}`)

    .then(res=>res.json())

    .then(property=>{

        const modalContent = `

        <div class="modal-content">

            <h2>Edit Property</h2>

            <form onsubmit="handleEditProperty(event,'${propertyId}')">

                <input type="text" id="editPropTitle"
                       value="${property.title}" required>

                <textarea id="editPropDescription"
                required>${property.description}</textarea>

                <input type="number" id="editPropAmount"
                       value="${property.amount}" required>

                <button type="submit">Update</button>

            </form>

        </div>
        `;

        const modal = document.getElementById("modalContainer");

        modal.innerHTML = modalContent;

        modal.classList.add("show");

    });

}



/* --------------------------------
   Update Property
-------------------------------- */

async function handleEditProperty(event,propertyId){

    event.preventDefault();

    const updatedProperty = {

        title: document.getElementById("editPropTitle").value,

        description: document.getElementById("editPropDescription").value,

        amount: parseFloat(document.getElementById("editPropAmount").value)

    };

    try{

        showLoading();

        const response = await fetch(`/properties/${propertyId}`,{

            method:"PATCH",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(updatedProperty)

        });

        if(!response.ok){

            throw new Error("Update failed");

        }

        showToast("Property updated","success");

        closeModal();

        loadDashboard();

    }

    catch(error){

        console.error(error);

        showToast("Failed to update property","error");

    }

    finally{

        hideLoading();

    }

}



/* --------------------------------
   Delete Property
-------------------------------- */

async function deleteProperty(propertyId){

    if(!confirm("Delete this property?")) return;

    try{

        showLoading();

        const response = await fetch(`/properties/${propertyId}`,{

            method:"DELETE"

        });

        if(!response.ok){

            throw new Error("Delete failed");

        }

        showToast("Property deleted","success");

        loadDashboard();

    }

    catch(error){

        console.error(error);

        showToast("Delete failed","error");

    }

    finally{

        hideLoading();

    }

}



/* --------------------------------
   Upload Document
-------------------------------- */

async function handleUploadDocument(event){

    event.preventDefault();

    const doc = {

        id:generateId("doc"),

        seller_id:state.currentUser.id,

        document_name:document.getElementById("docName").value,

        document_url:document.getElementById("docUrl").value,

        status:"pending"

    };

    try{

        showLoading();

        const response = await fetch("/documents",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(doc)

        });

        if(!response.ok){

            throw new Error("Upload failed");

        }

        showToast("Document uploaded","success");

        closeModal();

        loadDashboard();

    }

    catch(error){

        console.error(error);

        showToast("Upload failed","error");

    }

    finally{

        hideLoading();

    }

}