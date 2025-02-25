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
  posts.forEach((post) => {
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

async function createPost(title, content) {
  const token = getAccessToken();
  if (!token) {
      alert("Вы не авторизованы!");
      return;
  }

  const response = await authFetch(`${apiUrl}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text: content, tags: "default", imageUrl: "" }),
  });

  if (!response.ok) {
      const errorData = await response.json();
      alert(`Ошибка: ${errorData.message}`);
      return;
  }

  alert("Пост успешно опубликован!");
  loadPosts();
}

async function editPost(postId, oldTitle, oldText) {
  const newTitle = prompt("Введите новый заголовок:", oldTitle);
  if (!newTitle) return;

  const newText = prompt("Введите новый текст:", oldText);
  if (!newText) return;

  const response = await authFetch(`${apiUrl}/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, text: newText, imageUrl: "", tags: "" }),
  });

  if (response.ok) {
      alert("Пост обновлён!");
      loadPosts();
  } else {
      alert("Ошибка при обновлении поста");
  }
}

async function deletePost(id) {
  const response = await authFetch(`${apiUrl}/posts/${id}`, { method: "DELETE" });

  if (response.ok) {
      document.getElementById(`post-${id}`).remove();
      alert("Пост удалён");
  } else {
      alert("Ошибка при удалении");
  }
}
