function handleRegister() {
  let name = document.getElementById("reg-name").value.trim();
  let phone = document.getElementById("reg-phone").value.trim();
  let email = document.getElementById("reg-email").value.trim();
  let password = document.getElementById("reg-password").value.trim();
  let gender = document.getElementById("reg-gender").value;
  let err = document.getElementById("reg-error");
  let success = document.getElementById("reg-success");
  err.style.display = "none";
  success.style.display = "none";

  let nameRegex = /^[a-zA-Z\s]{2,50}$/;
  let phoneRegex = /^07\d{8}$/;
  let emailRegex = /^[^\s@]+@(yahoo|gmail|outlook|hotmail)\.[a-zA-Z]{2,}$/i;
  let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  if (!name || !phone || !email || !password || !gender) {
    err.textContent = "Please fill in all fields.";
    err.style.display = "block";
  } else if (!nameRegex.test(name)) {
    err.textContent = "Name must contain only letters and space (2-50 chars).";
    err.style.display = "block";
  } else if (!phoneRegex.test(phone)) {
    err.textContent = "Phone number must be exactly 10 digits and start with 07.";
    err.style.display = "block";
  } else if (!emailRegex.test(email)) {
    err.textContent = "Email must be a yahoo, gmail, outlook, or hotmail address.";
    err.style.display = "block";
  } else if (!passwordRegex.test(password)) {
    err.textContent = "Password must be min 8 chars, with at least one letter and one number.";
    err.style.display = "block";
  } else {
    let result = register(name, phone, email, password, gender);
    if (result.success) {
      login(email, password);
      success.textContent = "Account created! Redirecting to dashboard...";
      success.style.display = "block";
      setTimeout(function() {
        window.location.href = "index.html";
      }, 1000);
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
    document.getElementById("register-btn").addEventListener("click", handleRegister);

    let cb = document.getElementById("show-reg-password");
    if (cb) {
      cb.addEventListener("change", function() {
        let pass = document.getElementById("reg-password");
        if (this.checked) {
          pass.type = "text";
        } else {
          pass.type = "password";
        }
      });
    }
  }
};
