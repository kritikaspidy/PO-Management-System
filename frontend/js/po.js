requireAuth();

let vendors = [];
let products = [];

const vendorSelect = document.getElementById("vendorSelect");
const productRows = document.getElementById("productRows");
const addRowBtn = document.getElementById("addRowBtn");
const resetFormBtn = document.getElementById("resetFormBtn");
const poForm = document.getElementById("poForm");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const alertBox = document.getElementById("alertBox");

document.addEventListener("DOMContentLoaded", () => {
  const emailEl = document.getElementById("userEmail");
  const userEmail = localStorage.getItem("user_email");
  if (emailEl && userEmail) {
    emailEl.textContent = userEmail;
  }
});

async function initializeForm() {
  try {
    vendors = await apiGet("/vendors/");
    products = await apiGet("/products/");

    loadVendorOptions();

    if (!products.length) {
      showAlert("No products available. Create products from the backend first.", "danger");
      return;
    }

    addProductRow();
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

function loadVendorOptions() {
  if (!vendors.length) {
    vendorSelect.innerHTML = `<option value="">No vendors available</option>`;
    return;
  }

  vendorSelect.innerHTML = `
    <option value="">Select a vendor</option>
    ${vendors.map(vendor => `
      <option value="${vendor.id}">
        ${vendor.name} — Rating ${vendor.rating}
      </option>
    `).join("")}
  `;
}

function getProductOptions() {
  return `
    <option value="">Select product</option>
    ${products.map(product => `
      <option value="${product.id}">
        ${product.name} (${product.sku})
      </option>
    `).join("")}
  `;
}

function addProductRow() {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>
      <select class="form-select product-select" required>
        ${getProductOptions()}
      </select>
    </td>
    <td>
      <input type="text" class="form-control unit-price" value="0.00" readonly />
    </td>
    <td>
      <input type="number" class="form-control quantity-input" min="1" value="1" required />
    </td>
    <td>
      <input type="text" class="form-control line-total" value="0.00" readonly />
    </td>
    <td class="text-center">
      <button type="button" class="btn btn-outline-danger btn-sm btn-modern remove-row-btn">Remove</button>
    </td>
  `;

  productRows.appendChild(row);

  const productSelect = row.querySelector(".product-select");
  const quantityInput = row.querySelector(".quantity-input");
  const removeBtn = row.querySelector(".remove-row-btn");

  productSelect.addEventListener("change", () => updateRow(row));
  quantityInput.addEventListener("input", () => updateRow(row));
  removeBtn.addEventListener("click", () => {
    row.remove();
    calculateTotals();

    if (!productRows.querySelectorAll("tr").length) {
      addProductRow();
    }
  });
}

function updateRow(row) {
  const productId = Number(row.querySelector(".product-select").value);
  const quantity = Number(row.querySelector(".quantity-input").value) || 0;
  const unitPriceInput = row.querySelector(".unit-price");
  const lineTotalInput = row.querySelector(".line-total");

  const selectedProduct = products.find(product => product.id === productId);

  if (!selectedProduct) {
    unitPriceInput.value = "0.00";
    lineTotalInput.value = "0.00";
    calculateTotals();
    return;
  }

  const unitPrice = Number(selectedProduct.unit_price);
  const lineTotal = unitPrice * quantity;

  unitPriceInput.value = unitPrice.toFixed(2);
  lineTotalInput.value = lineTotal.toFixed(2);

  calculateTotals();
}

function calculateTotals() {
  let subtotal = 0;

  productRows.querySelectorAll("tr").forEach(row => {
    subtotal += Number(row.querySelector(".line-total").value) || 0;
  });

  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  subtotalEl.textContent = subtotal.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  totalEl.textContent = total.toFixed(2);
}

function showAlert(message, type = "success") {
  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

function resetFormUI() {
  poForm.reset();
  productRows.innerHTML = "";
  alertBox.innerHTML = "";
  addProductRow();
  calculateTotals();
}

poForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const vendorId = Number(vendorSelect.value);
  const rows = productRows.querySelectorAll("tr");

  if (!vendorId) {
    showAlert("Please select a vendor.", "danger");
    return;
  }

  if (!rows.length) {
    showAlert("Please add at least one product row.", "danger");
    return;
  }

  const items = [];

  for (const row of rows) {
    const productId = Number(row.querySelector(".product-select").value);
    const quantity = Number(row.querySelector(".quantity-input").value);

    if (!productId || quantity <= 0) {
      showAlert("Each row must have a valid product and quantity.", "danger");
      return;
    }

    items.push({
      product_id: productId,
      quantity: quantity
    });
  }

  try {
    const result = await apiPost("/purchase-orders/", {
      vendor_id: vendorId,
      items
    });

    showAlert(`Purchase Order created successfully. Reference: ${result.reference_no}`, "success");
    resetFormUI();
  } catch (error) {
    showAlert(error.message, "danger");
  }
});

addRowBtn.addEventListener("click", addProductRow);
resetFormBtn.addEventListener("click", resetFormUI);

initializeForm();