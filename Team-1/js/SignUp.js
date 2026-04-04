const form = document.querySelector("#form");

const usernameInput = document.querySelector("#username");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const genderInput = document.querySelector("#gender");
const phoneInput = document.querySelector("#phone");

const nameError = document.querySelector("#nameError");
const emailError = document.querySelector("#emailError");
const passError = document.querySelector("#passError");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let isValid = true;

  if (usernameInput.value.trim().length < 3) {
    nameError.textContent = "Name too short";
    isValid = false;
  } else {
    nameError.textContent = "";
  }

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

  const user = {
    id: Date.now(),
    username: usernameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
    gender: genderInput.value,
    phone: phoneInput.value,
  };

  let users = localStorage.getItem("users");

  if (users === null) {
    users = [];
  } else {
    users = JSON.parse(users);
  }

  const emailExists = users.some((u) => u.email === user.email);

  if (emailExists) {
    alert("Email already exists ❌");
    return;
  }

  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registered Successfully ✅");

  console.log(users);

  form.reset();
});
