requireAuth();

document.addEventListener("DOMContentLoaded", () => {
  const emailEl = document.getElementById("userEmail");
  const userEmail = localStorage.getItem("user_email");
  if (emailEl && userEmail) {
    emailEl.textContent = userEmail;
  }

  loadVendors();
});

const vendorForm = document.getElementById("vendorForm");
const vendorTableBody = document.getElementById("vendorTableBody");
const vendorAlertBox = document.getElementById("vendorAlertBox");

function showVendorAlert(message, type = "success") {
  vendorAlertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

async function loadVendors() {
  try {
    const vendors = await apiGet("/vendors/");

    if (!vendors.length) {
      vendorTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-4 muted-text">No vendors available.</td>
        </tr>
      `;
      return;
    }

    vendorTableBody.innerHTML = vendors.map(vendor => `
      <tr>
        <td>#${vendor.id}</td>
        <td>${vendor.name}</td>
        <td>${vendor.contact}</td>
        <td>${vendor.rating}</td>
      </tr>
    `).join("");
  } catch (error) {
    vendorTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger py-4">${error.message}</td>
      </tr>
    `;
  }
}

vendorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("vendorName").value.trim();
  const contact = document.getElementById("vendorContact").value.trim();
  const rating = Number(document.getElementById("vendorRating").value);

  if (!name || !contact) {
    showVendorAlert("Please fill all required fields.", "danger");
    return;
  }

  try {
    await apiPost("/vendors/", { name, contact, rating });
    showVendorAlert("Vendor added successfully.", "success");
    vendorForm.reset();
    loadVendors();
  } catch (error) {
    showVendorAlert(error.message, "danger");
  }
});