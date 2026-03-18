requireAuth();

document.addEventListener("DOMContentLoaded", () => {
  const emailEl = document.getElementById("userEmail");
  const userEmail = localStorage.getItem("user_email");
  if (emailEl && userEmail) {
    emailEl.textContent = userEmail;
  }

  loadProducts();
});

const productForm = document.getElementById("productForm");
const productTableBody = document.getElementById("productTableBody");
const productAlertBox = document.getElementById("productAlertBox");

function showProductAlert(message, type = "success") {
  productAlertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

async function loadProducts() {
  try {
    const products = await apiGet("/products/");

    if (!products.length) {
      productTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 muted-text">No products available.</td>
        </tr>
      `;
      return;
    }

    productTableBody.innerHTML = products.map(product => `
      <tr>
        <td>#${product.id}</td>
        <td>${product.name}</td>
        <td>${product.sku}</td>
        <td>${product.category || "-"}</td>
        <td>₹${Number(product.unit_price).toFixed(2)}</td>
        <td>${product.stock_level}</td>
      </tr>
    `).join("");
  } catch (error) {
    productTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger py-4">${error.message}</td>
      </tr>
    `;
  }
}

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const sku = document.getElementById("productSku").value.trim();
  const category = document.getElementById("productCategory").value.trim();
  const unit_price = Number(document.getElementById("productPrice").value);
  const stock_level = Number(document.getElementById("productStock").value);

  if (!name || !sku) {
    showProductAlert("Please fill all required fields.", "danger");
    return;
  }

  try {
    await apiPost("/products/", {
      name,
      sku,
      category,
      unit_price,
      stock_level
    });

    showProductAlert("Product added successfully.", "success");
    productForm.reset();
    loadProducts();
  } catch (error) {
    showProductAlert(error.message, "danger");
  }
});