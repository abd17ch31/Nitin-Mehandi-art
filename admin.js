// Admin Login
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const btnText = loginBtn.querySelector(".btn-text");
  const btnLoader = loginBtn.querySelector(".btn-loader");
  const errorMessage = document.getElementById("errorMessage");

  // Default admin credentials (you should change these!)
  const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123"
  };

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    // Show loading state
    loginBtn.disabled = true;
    btnText.style.display = "none";
    btnLoader.style.display = "flex";
    errorMessage.classList.remove("show");
    errorMessage.textContent = "";

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Store login session
      sessionStorage.setItem("adminLoggedIn", "true");
      sessionStorage.setItem("adminUsername", username);

      // Redirect to dashboard
      window.location.href = "admin-dashboard.html";
    } else {
      // Show error
      errorMessage.textContent = "Invalid username or password";
      errorMessage.classList.add("show");
      
      // Reset button state
      loginBtn.disabled = false;
      btnText.style.display = "flex";
      btnLoader.style.display = "none";
    }
  });
});




