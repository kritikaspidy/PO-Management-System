const API_BASE_URL = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("jwt");
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

async function apiGet(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders()
  });

  if (response.status === 401) {
    logoutAndRedirect();
    return;
  }

  if (!response.ok) {
    throw new Error(`GET ${endpoint} failed`);
  }

  return response.json();
}

async function apiPost(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (response.status === 401) {
    logoutAndRedirect();
    return;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || `POST ${endpoint} failed`);
  }

  return result;
}

async function apiPatch(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (response.status === 401) {
    logoutAndRedirect();
    return;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || `PATCH ${endpoint} failed`);
  }

  return result;
}

function logoutAndRedirect() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user_email");
  window.location.href = "login.html";
}