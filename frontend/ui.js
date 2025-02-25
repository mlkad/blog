function showPanel(panel) {
  document.querySelector(".auth-forms").style.display = panel === "auth" ? "block" : "none";
  document.querySelector(".posts-container").style.display = panel === "posts" ? "block" : "none";
  document.querySelector(".profile").style.display = panel === "profile" ? "block" : "none";
}

function updateAuthButton() {
  const userId = getUserId();
  const authBtn = document.querySelector(".auth-btn");
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
  loadUserProfile();
}

function showAuthPanel() {
  showPanel("auth");
}
