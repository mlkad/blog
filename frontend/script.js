document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:4404";
  const token = localStorage.getItem("token");
  if (token) {
    showPanel("posts"); // Показываем посты, если пользователь авторизован
  } else {
    showPanel("auth"); // Иначе показываем авторизацию
  }
  // Функции получения токенов и userId из localStorage
  function getAccessToken() {
    return localStorage.getItem("token");
  }

  function getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  function getUserId() {
    return localStorage.getItem("userId");
  }

  function updateAuthButton() {
    const userId = getUserId();
    authBtn.removeEventListener("click", showAuthPanel);
    authBtn.removeEventListener("click", showProfile);

    if (userId) {
      authBtn.textContent = "Profile";
      authBtn.addEventListener("click", showProfile);
    } else {
      authBtn.textContent = "Login";
      authBtn.addEventListener("click", showAuthPanel);
    }
  }

  function showProfile() {
    showPanel("profile");
    loadUserProfile(); // Загружаем данные профиля
  }

  function showAuthPanel() {
    showPanel("auth");
  }

  // Функция обновления токенов через endpoint /auth/refresh-token
  async function refreshTokens() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      alert("Нет refresh токена!");
      return false;
    }
    const response = await fetch(`${apiUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (data.accessToken && data.refreshToken) {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      console.log("Токены успешно обновлены!");
      return true;
    } else {
      alert(data.message || "Ошибка при обновлении токенов");
      return false;
    }
  }

  // Обёртка для fetch, которая добавляет access-token в заголовки
  async function authFetch(url, options = {}) {
    let accessToken = getAccessToken();
    options.headers = options.headers || {};
    options.headers.Authorization = `Bearer ${accessToken}`;

    let response = await fetch(url, options);

    // Если access token недействителен, пробуем обновить его
    if (response.status === 401) {
      console.log("Access token недействителен, пытаемся обновить...");
      const refreshed = await refreshTokens();
      if (refreshed) {
        // Обновляем заголовок и повторяем запрос
        accessToken = getAccessToken();
        options.headers.Authorization = `Bearer ${accessToken}`;
        response = await fetch(url, options);
      } else {
        // Если обновление не удалось — очищаем данные и просим войти заново
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        alert("Ваша сессия истекла. Пожалуйста, войдите заново.");
      }
    }
    return response;
  }

  const authForms = document.querySelector(".auth-forms");
  const postsContainer = document.querySelector(".posts-container");

  const authBtn = document.querySelector(".auth-btn");
  const postsBtn = document.querySelector(".posts-btn");
  const logoutBtn = document.querySelector(".logout-btn");

  // Функция для показа определенной панели и скрытия других
  function showPanel(panel) {
    document.querySelector(".auth-forms").style.display =
      panel === "auth" ? "block" : "none";
    document.querySelector(".posts-container").style.display =
      panel === "posts" ? "block" : "none";
    document.querySelector(".profile").style.display =
      panel === "profile" ? "block" : "none";
  }

  logoutBtn.addEventListener("click", logoutUser);

  // Переключение на панель аутентификации
  authBtn.addEventListener("click", () => {
    showPanel("auth");
  });

  // Переключение на панель постов
  postsBtn.addEventListener("click", () => {
    showPanel("posts");
  });

  // При загрузке страницы показать форму авторизации, если пользователь не залогинен
  document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (token) {
      showPanel("posts"); // Показываем посты, если пользователь авторизован
    } else {
      showPanel("auth"); // Иначе показываем авторизацию
    }
  });

  function logoutUser() {
    // Удаляем данные пользователя из localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");

    // Обновляем кнопку авторизации
    updateAuthButton();

    // Показываем экран входа
    showPanel("auth");

    alert("Вы вышли из системы");
  }

  async function loadUserProfile() {
    try {
      const userId = getUserId();
      if (!userId) {
        console.log("Пользователь не авторизован");
        return;
      }
  
      const response = await authFetch(`${apiUrl}/users/${userId}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки профиля");
      }
  
      const userData = await response.json();
      console.log("Данные пользователя:", userData); // Проверьте данные
      document.getElementById("userEmail").textContent = userData.email;
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось загрузить данные профиля.");
    }
  }
  
  function showProfile() {
    console.log("Показ профиля..."); // Проверка вызова
    showPanel("profile");
    loadUserProfile();
  }

  // Регистрация
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      alert(data.message);
    });

  // Верификация OTP
  document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otpCode").value;
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
  });

  // Вход
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

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
      updateAuthButton(); // Обновить кнопку после входа
    } else {
      alert(data.message);
    }
  });

  updateAuthButton();

  // Работа с постами
  document.getElementById("postForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      alert("Вы не авторизованы!");
      return;
    }
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    const response = await authFetch(`${apiUrl}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title,
        text: content,
        tags: "default",
        imageUrl: "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Ошибка: ${errorData.message}`);
      return;
    }

    alert("Пост успешно опубликован!");
    loadPosts();
  });

  async function loadPosts() {
    const token = getAccessToken();
    if (!token) {
      console.log("Пользователь не авторизован");
      return;
    }

    const response = await authFetch(`${apiUrl}/posts`);
    const posts = await response.json();
    const postsContainer = document.getElementById("posts");
    postsContainer.innerHTML = "";

    const currentUserId = getUserId();
    console.log("Текущий пользователь:", currentUserId);

    posts.forEach((post) => {
      console.log("Автор поста:", post.user ? post.user._id : "Нет автора");

      const isAuthor = post.user && post.user._id === currentUserId;
      postsContainer.innerHTML += `
      <div class="post" id="post-${post._id}">
          <h3>${post.title}</h3>
          <p>${post.text}</p>
          ${
            isAuthor
              ? `
            <button onclick="editPost('${post._id}', '${post.title}', '${post.text}')">Редактировать</button>
            <button onclick="deletePost('${post._id}')">Удалить</button>
          `
              : ""
          }
      </div>`;
    });
  }

  window.editPost = async function editPost(postId, oldTitle, oldText) {
    const newTitle = prompt("Введите новый заголовок:", oldTitle);
    if (!newTitle) return;

    const newText = prompt("Введите новый текст:", oldText);
    if (!newText) return;

    const response = await authFetch(`${apiUrl}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
        text: newText,
        imageUrl: "",
        tags: "",
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Пост обновлён!");
      loadPosts();
    } else {
      alert("Ошибка при обновлении поста");
    }
  };

  window.deletePost = async function (id) {
    const response = await authFetch(`${apiUrl}/posts/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (response.ok && result.success) {
      document.getElementById(`post-${id}`).remove();
      alert("Пост удалён");
    } else {
      alert(result.message || "Ошибка при удалении");
    }
  };

  loadPosts();
});