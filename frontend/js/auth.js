async function handleCredentialResponse(response) {
  try {
    const googleToken = response.credential;

    const res = await fetch("http://localhost:8000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: googleToken })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }

    localStorage.setItem("jwt", data.access_token);
    localStorage.setItem("user_email", data.email);

    window.location.replace("http://localhost:5500/index.html");
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user_email");
  window.location.replace("http://localhost:5500/login.html");
}