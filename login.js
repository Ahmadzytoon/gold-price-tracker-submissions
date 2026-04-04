const loginBtn = document.querySelector(".btns-header button:nth-child(1)");
const registerBtn = document.querySelector(".btns-header button:nth-child(2)");

// خلي زر Login active
loginBtn.classList.add("active");

// تنقل بين الصفحات
loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
});

registerBtn.addEventListener("click", () => {
    window.location.href = "register.html";
});


const form = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let isValid = true;

    document.querySelectorAll(".error").forEach(el => el.textContent = "");

    if (emailInput.value.trim() === "") {
        emailInput.nextElementSibling.textContent = "Email is required";
        isValid = false;
    }

    if (passwordInput.value.trim() === "") {
        passwordInput.nextElementSibling.textContent = "Password is required";
        isValid = false;
    }

    if (!isValid) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === emailInput.value.trim() && u.password === passwordInput.value);

    if (!user) {
        passwordInput.nextElementSibling.textContent = "Invalid email or password";
        return;
    }

    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "index.html";
});