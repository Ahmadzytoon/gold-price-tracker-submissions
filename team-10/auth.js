let isLoginMode = true;

function toggleAuth() {
    isLoginMode = !isLoginMode;

    const nameGroup = document.getElementById('name-group');
    const confirmGroup = document.getElementById('confirm-group'); // New
    const phoneGroup = document.getElementById('phone-group');
    const genderGroup = document.getElementById('gender-group');

    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const btn = document.getElementById('auth-btn');
    const toggleText = document.getElementById('toggle-text');

    const alertBoxt = document.getElementById('alert');
    alertBoxt.classList.add('d-none');

    if (isLoginMode) {
        nameGroup.classList.add('d-none');
        confirmGroup.classList.add('d-none');
        phoneGroup.classList.add('d-none');
        genderGroup.classList.add('d-none');

        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Login to manage your gold assets';
        btn.textContent = 'Login';
        toggleText.innerHTML = 'Don\'t have an account? <span class ="toggle-link" onclick="toggleAuth()"> Register here</span>';



    } else {
        nameGroup.classList.remove('d-none');
        confirmGroup.classList.remove('d-none');
        phoneGroup.classList.remove('d-none');
        genderGroup.classList.remove('d-none');

        title.textContent = 'Create Account';
        subtitle.textContent = 'Register to start tracking your gold';
        btn.textContent = 'Register';
        toggleText.innerHTML = 'Already have an account? <span class="toggle-link" onclick="toggleAuth()">Login here</span>';

    }
}
function handelRegister(e) {
    if (e) e.preventDefault();

    const email = document.getElementById('user-email').value.trim();
    const pass = document.getElementById('user-pass').value;
    const name = document.getElementById('user-name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const gender = document.getElementById('gender').value;
    const confirmPass = document.getElementById('user-pass-confirm').value;

    const alertBox = document.getElementById('alert');
    function showAlert(message) {
        alertBox.textContent = message;
        alertBox.classList.remove('d-none');
    }

    function hideAlert() {
        alertBox.classList.add('d-none');
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (isLoginMode) {
        if (!email || !pass) {
            showAlert('Please fill in all fields');
            return;
        }

        const user = users.find(function (u) {
            return u.email === email && u.password === pass;
        });

        if (user) {
            hideAlert();

            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('activeUser', JSON.stringify(user));

            window.location.href = 'index.html';
        } else {
            showAlert('Invalid Email or Password!');
        }

    } else {
        const inputName = document.getElementById('user-name');
        const inputEmail = document.getElementById('user-email');
        const inputPass = document.getElementById('user-pass');
        const inputConfirm = document.getElementById('user-pass-confirm');

        if (!name || !email || !pass) {
            showAlert('Please fill in all required fields.');
            inputName.style.borderColor = 'red';
            inputEmail.style.borderColor = 'red';
            inputPass.style.borderColor = 'red';
            inputConfirm.style.borderColor = 'red';


            return;
        }


        const passRegex = /^[A-Z](?=(.*[0-9]){2,})(?=.*[!@#$%^&*]).{7,31}$/;

        if (!passRegex.test(pass)) {
            showAlert('Password must: start with uppercase • contain 2+ numbers • contain a special character (!@#$%^&*) • be 8\–32 chars long');
            return;
        }

        const passFeedback = document.getElementById('pass-feedback');

        if (pass !== confirmPass) {
            passFeedback.classList.remove('d-none');
            showAlert('passowrds do not match');
            return;
        } else {
            passFeedback.classList.add('d-none');
        }

        const phoneError = document.getElementById('phoneError');
        const phonePattern = /^((\+962)|0)7[789]\d{7}$/;

        if (!phone || !phonePattern.test(phone)) {
            phoneError.textContent = ('Please enter a valid phone number .');
            phoneError.classList.remove('d-none');
            return;
        } else {
            phoneError.classList.add('d-none');
        }

        const genderError = document.getElementById('genderError');

        if (!gender) {
            genderError.classList.remove('d-none');
            showAlert('please select your gender.');
            return;
        } else {
            genderError.classList.add('d-none');
        }

        const alreadyExists = users.find(function (u) {
            return u.email === email;
        });

        if (alreadyExists) {
            showAlert('This email is already registed. Please login.');
            return;
        }

        const newUser = {
            name: name,
            email: email,
            password: pass,
            phone: phone,
            gender: gender
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        hideAlert();

        showAlert('Registration successful! Redirecting to login...');
        alertBox.classList.replace('text-danger', 'text-success');

        setTimeout(() => {
            toggleAuth();
            alertBox.classList.replace('text-success', 'text-danger');
            hideAlert();
        }, 2000);
    }
}

window.onload = function () {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }

    document.getElementById('alert').classList.add('d-none');
};


function togglePassword(inputId, btn) {
    const passwordInput = document.getElementById('user-pass');

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        btn.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        btn.textContent = "Show";
    }


};

function toggleConfirm(inputId, btn) {
    const passConfirm = document.getElementById('user-pass-confirm');

    if (passConfirm.type === "password") {
        passConfirm.type = "text";
        btn.textContent = "Hide";
    } else {
        passConfirm.type = "password";
        btn.textContent = "Show";
    }
}

// checking so my assets only appears to LoggedIn users

// <script>
//     (function() {
//         // Check if the login flag exists in sessionStorage
//         const isLoggedIn = sessionStorage.getItem('isLoggedIn');

//         if (isLoggedIn !== 'true') {
//             // User is NOT logged in - redirect them
//             alert("Access Denied. Please login to view your assets.");
//             window.location.href = 'login.html';
//         }
//     })();
// </script>


// function handleLogout() {
//     sessionStorage.clear();

//     // localStorage.removeItem('user_gold_settings');

//     window.location.href = 'login.html';


// }

