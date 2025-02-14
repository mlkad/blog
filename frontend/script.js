document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://localhost:4404";
  
  function getToken() {
    return localStorage.getItem("token");
  }
  
  function getUserId() {
    return localStorage.getItem("userId");
  }

  const authForms = document.querySelector(".auth-forms");
  const toggleAuthBtn = document.querySelector(".auth-btn");
  const postsContainer = document.querySelector(".posts-container");

  toggleAuthBtn.addEventListener("click", () => {
    authForms.style.display =
      authForms.style.display === "none" ? "block" : "none";
    postsContainer.style.display =
      postsContainer.style.display === "block" ? "none" : "block";
  });

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

  document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otpCode").value;
    const response = await fetch(`${apiUrl}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("OTP подтвержден, вы вошли!");
    } else {
      alert(data.message);
    }
  });

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
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId); 
      alert("Вход выполнен!");
    } else {
      alert(data.message);
    }
    console.log("userId:", localStorage.getItem("userId"));

  });
  

  document.getElementById("postForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      alert("Вы не авторизованы!");
      return;
    }
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    const response = await fetch(`${apiUrl}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
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
    const token = getToken();
    if (!token) {
      console.log("Пользователь не авторизован");
      return;
    }

    const response = await fetch(`${apiUrl}/posts`);
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
          ${isAuthor ? `
            <button onclick="editPost('${post._id}', '${post.title}', '${post.text}')">Редактировать</button>
            <button onclick="deletePost('${post._id}')">Удалить</button>
          ` : ""}
      </div>`;      
    });
  }

  window.editPost = async function editPost(postId, oldTitle, oldText) {
    const newTitle = prompt("Введите новый заголовок:", oldTitle);
    if (!newTitle) return;
  
    const newText = prompt("Введите новый текст:", oldText);
    if (!newText) return;
  
    const token = getToken();
    if (!token) {
      alert("Вы не авторизованы!");
      return;
    }
  
    const response = await fetch(`${apiUrl}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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
  }
  
  window.deletePost = async function (id) {
    const token = getToken();
    const response = await fetch(`${apiUrl}/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
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
