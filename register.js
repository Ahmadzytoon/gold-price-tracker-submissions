const loginBtn = document.querySelector(".btns-header button:nth-child(1)");
const registerBtn = document.querySelector(".btns-header button:nth-child(2)");

registerBtn.classList.add("active");

loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
});

registerBtn.addEventListener("click", () => {
    window.location.href = "register.html";
});

const form = document.getElementById("registerForm");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const genderContainer = document.querySelector(".gender");
    const gender = document.querySelector('input[name="gender"]:checked');

    let isValid = true;

    document.querySelectorAll(".error").forEach(el => el.textContent = "");
    document.querySelectorAll(".fields").forEach(el => el.classList.remove("input-error"));

    function showError(input, message) { 
        input.classList.add("input-error");
        input.nextElementSibling.textContent = message;
        isValid = false;
    }

    if (name.value.trim() === "") {
        showError(name, "Name is required");
    }else if (name.value.length > 50) {
        showError(name, "MAX IS 50")
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === "") {
        showError(email, "Email is required");
    }else if (!emailPattern.test(email.value.trim())) {
        showError(email, "Invalid email format");
    }

    const phonePattern = /^07[789][0-9]{7}$/;
    if (phone.value.trim() === "") {
        showError(phone, "Phone Number is required");
    }else if (!phonePattern.test(phone.value.trim())) {
        showError(phone, "Invalid Number");
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (password.value.trim() === "") {
        showError(password, "password is required");
    }else if (!strongPassword.test(password.value.trim())) {
        showError(password, "Password must be at least 8 chars, include uppercase, lowercase, number & symbol");
    }

    if (confirmPassword.value.trim() === "") {
        showError(confirmPassword, "Write The Password Again");
    }else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, "Passwords do not match");
    }

    if (!gender) {
    genderContainer.querySelector(".error").textContent = "Please select gender";
    isValid = false;
    }else {
    genderContainer.querySelector(".error").textContent = "";
    }

    if (!isValid) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(user => user.email === email.value.trim());

    if (exists) {
    showError(email, "Email already registered");
    return;
    }

    const newUser = {
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    gender: gender.value,
    password: password.value
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    window.location.href = "login.html";
});

document.querySelectorAll(".fields").forEach(input => {
    input.addEventListener("input", () => {
    input.classList.remove("input-error");

    if (input.nextElementSibling) {
        input.nextElementSibling.textContent = "";
    }
    });
});