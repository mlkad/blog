async function registerUser(email, password) {
  const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  alert(data.message);
}

async function verifyOtp(otp) {
  const response = await fetch(`${apiUrl}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
  });
  const data = await response.json();
  if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", data.userId || "");
      alert("OTP подтвержден, вы вошли!");
  } else {
      alert(data.message);
  }
}

async function loginUser(email, password) {
  const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", data.userId);
      alert("Вход выполнен!");
      updateAuthButton();
  } else {
      alert(data.message);
  }
}

function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  updateAuthButton();
  showPanel("auth");
  alert("Вы вышли из системы");
}
