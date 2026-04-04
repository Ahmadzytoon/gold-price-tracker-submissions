const form = document.querySelector("#loginForm");

const emailInput = document.querySelector("#loginEmail");
const passwordInput = document.querySelector("#loginPassword");

const emailError = document.querySelector("#emailError");
const passError = document.querySelector("#passError");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let isValid = true;

  if (!emailPattern.test(emailInput.value)) {
    emailError.textContent = "Invalid email";
    isValid = false;
  } else {
    emailError.textContent = "";
  }

  if (passwordInput.value.length < 6) {
    passError.textContent = "Password too short";
    isValid = false;
  } else {
    passError.textContent = "";
  }

  if (!isValid) return;

  let users = localStorage.getItem("users");

  if (users === null) {
    alert("No users found ❌");
    return;
  }

  users = JSON.parse(users);

  const foundUser = users.find(
    (u) => u.email === emailInput.value && u.password === passwordInput.value,
  );

  if (foundUser) {
    sessionStorage.setItem("currentUser", JSON.stringify(foundUser));
    alert("Login Successful ✅");
    window.location.href = "index.html";
  } else {
    alert("Email or Password incorrect ❌");
  }
});
