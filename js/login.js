function handleLogin() {
  let email = document.getElementById("login-email").value.trim();
  let password = document.getElementById("login-password").value.trim();
  let err = document.getElementById("login-error");
  let emailRegex = /^[^\s@]+@(yahoo|gmail|outlook|hotmail)\.[a-zA-Z]{2,}$/i;

  if (!email || !password) {
    err.textContent = "Please fill in all fields.";
    err.style.display = "block";
  } else if (!emailRegex.test(email)) {
    err.textContent = "Please enter a valid yahoo, gmail, outlook, or hotmail address.";
    err.style.display = "block";
  } else {
    let result = login(email, password);
    if (result.success) {
      window.location.href = "index.html";
    } else {
      err.textContent = result.message;
      err.style.display = "block";
    }
  }
}

window.onload = function() {
  if (getCurrentUser()) {
    window.location.href = "index.html";
  } else {
    document.getElementById("login-btn").addEventListener("click", handleLogin);

    let cb = document.getElementById("show-password");
    if (cb) {
      cb.addEventListener("change", function() {
        let pass = document.getElementById("login-password");
        if (this.checked) {
          pass.type = "text";
        } else {
          pass.type = "password";
        }
      });
    }
  }
};
