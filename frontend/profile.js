async function loadUserProfile() {
  const userId = getUserId();
  if (!userId) {
      console.log("Пользователь не авторизован");
      return;
  }

  const response = await authFetch(`${apiUrl}/users/${userId}`);
  if (response.ok) {
      const userData = await response.json();
      document.getElementById("userEmail").textContent = userData.email;
  } else {
      console.log("Ошибка загрузки профиля");
  }
}
