requireAuth();

let allPurchaseOrders = [];
let currentFilter = "all";
let currentSearch = "";

document.addEventListener("DOMContentLoaded", () => {
  const emailEl = document.getElementById("userEmail");
  const userEmail = localStorage.getItem("user_email");

  if (emailEl && userEmail) {
    emailEl.textContent = userEmail;
  }

  setupFilters();
  setupSearch();
  loadPurchaseOrders();
});

function setupFilters() {
  const tabs = document.querySelectorAll(".dashboard-filter-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      renderPurchaseOrders();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById("dashboardSearch");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.trim().toLowerCase();
    renderPurchaseOrders();
  });
}

async function loadPurchaseOrders() {
  const tableBody = document.getElementById("poTableBody");
  const totalPOs = document.getElementById("totalPOs");
  const pendingPOs = document.getElementById("pendingPOs");
  const approvedPOs = document.getElementById("approvedPOs");

  try {
    const purchaseOrders = await apiGet("/purchase-orders/");
    allPurchaseOrders = Array.isArray(purchaseOrders) ? purchaseOrders : [];

    totalPOs.textContent = allPurchaseOrders.length;
    pendingPOs.textContent = allPurchaseOrders.filter(
      (po) => (po.status || "").toLowerCase() === "pending"
    ).length;
    approvedPOs.textContent = allPurchaseOrders.filter(
      (po) => (po.status || "").toLowerCase() === "approved"
    ).length;

    renderPurchaseOrders();
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-danger py-4">${error.message}</td>
      </tr>
    `;
  }
}

function renderPurchaseOrders() {
  const tableBody = document.getElementById("poTableBody");
  let filteredOrders = [...allPurchaseOrders];

  if (currentFilter !== "all") {
    filteredOrders = filteredOrders.filter(
      (po) => (po.status || "").toLowerCase() === currentFilter
    );
  }

  if (currentSearch) {
    filteredOrders = filteredOrders.filter((po) => {
      const idText = String(po.id || "").toLowerCase();
      const referenceText = String(po.reference_no || "").toLowerCase();
      const vendorText = String(po.vendor_id || "").toLowerCase();
      const statusText = String(po.status || "").toLowerCase();

      return (
        idText.includes(currentSearch) ||
        referenceText.includes(currentSearch) ||
        vendorText.includes(currentSearch) ||
        statusText.includes(currentSearch)
      );
    });
  }

  if (!filteredOrders.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-5 text-muted">No purchase orders found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredOrders
    .map(
      (po) => `
        <tr>
          <td><strong>#${po.id}</strong></td>
          <td>${po.reference_no}</td>
          <td>${po.vendor_id}</td>
          <td>${renderStatus(po.status)}</td>
          <td>
            <select class="form-select admin-status-select" onchange="changePOStatus(${po.id}, this.value)">
              <option value="">Select</option>
              <option value="Pending" ${po.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Approved" ${po.status === "Approved" ? "selected" : ""}>Approved</option>
              <option value="Rejected" ${po.status === "Rejected" ? "selected" : ""}>Rejected</option>
              <option value="Completed" ${po.status === "Completed" ? "selected" : ""}>Completed</option>
            </select>
          </td>
          <td>₹${Number(po.subtotal).toFixed(2)}</td>
          <td>₹${Number(po.tax_amount).toFixed(2)}</td>
          <td><strong>₹${Number(po.total_amount).toFixed(2)}</strong></td>
          <td>${formatDate(po.created_at)}</td>
        </tr>
      `
    )
    .join("");
}

async function changePOStatus(poId, status) {
  if (!status) return;

  try {
    await apiPatch(`/purchase-orders/${poId}/status`, { status });

    const targetPO = allPurchaseOrders.find((po) => po.id === poId);
    if (targetPO) {
      targetPO.status = status;
    }

    updateCounts();
    renderPurchaseOrders();
  } catch (error) {
    alert(error.message);
  }
}

function updateCounts() {
  const totalPOs = document.getElementById("totalPOs");
  const pendingPOs = document.getElementById("pendingPOs");
  const approvedPOs = document.getElementById("approvedPOs");

  totalPOs.textContent = allPurchaseOrders.length;
  pendingPOs.textContent = allPurchaseOrders.filter(
    (po) => (po.status || "").toLowerCase() === "pending"
  ).length;
  approvedPOs.textContent = allPurchaseOrders.filter(
    (po) => (po.status || "").toLowerCase() === "approved"
  ).length;
}

function renderStatus(status) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "approved") {
    return `<span class="admin-status-badge admin-status-approved">Approved</span>`;
  }
  if (normalized === "pending") {
    return `<span class="admin-status-badge admin-status-pending">Pending</span>`;
  }
  if (normalized === "rejected") {
    return `<span class="admin-status-badge admin-status-rejected">Rejected</span>`;
  }
  if (normalized === "completed") {
    return `<span class="admin-status-badge admin-status-completed">Completed</span>`;
  }

  return `<span class="admin-status-badge">${status || "-"}</span>`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}