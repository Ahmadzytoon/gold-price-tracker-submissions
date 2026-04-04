function getSessionUser() {
    try {
        const user = sessionStorage.getItem("currentUser");
        if (user !== null) {
            return JSON.parse(user);
        } else {
            return null;
        }
    } catch (e) {
        console.error("Session parsing error:", e);
        return null;
    }
}

let currentUser = getSessionUser();

if (currentUser === null) {
    currentUser = {
        email: "",
        firstName: "",
        lastName: "",
        gender: "",
        isLoggedIn: false
    };
}

window.handleLogout = function (e) {
    if (e !== undefined && e !== null) {
        e.preventDefault();
    }
    sessionStorage.removeItem("currentUser");
    window.location.href = "../html/index.html";
};

// ─── Helpers (safe on ALL pages) ─────────────────────────────────────────────
function getUsers() {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers !== null) {
        return JSON.parse(storedUsers);
    } else {
        return [];
    }
}

function checkEmailExists(email) {
    const users = getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

// ─── Grab navbar buttons ──────────────────────────────────────────────────────
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn'); // kept for backward compat (myAssets)

function updateNavbar(isLoggedIn) {
    var authButtons = document.getElementById('navAuthButtons');
    var profileDropdown = document.getElementById('navProfileDropdown');

    // OLD navbar style (myAssets page still uses loginBtn/logoutBtn directly)
    if (authButtons === null && loginBtn !== null) {
        if (isLoggedIn) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
        updateMobileMenu(isLoggedIn);
        return;
    }

    // NEW navbar style (index + prices pages)
    if (authButtons === null || profileDropdown === null) {
        updateMobileMenu(isLoggedIn);
        return;
    }

    if (isLoggedIn) {
        authButtons.style.display = 'none';
        profileDropdown.style.display = 'flex';

        // Populate name in trigger
        var nameEl = document.getElementById('navProfileName');
        if (nameEl) nameEl.textContent = currentUser.firstName || '';

        // Set avatar based on gender
        var imgEl = document.getElementById('navProfileImg');
        if (imgEl) {
            imgEl.src = currentUser.gender === 'm'
                ? '../assets/images/male.png'
                : '../assets/images/female.png';
        }

        // Populate profile modal fields
        var joined = currentUser.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        var setModal = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val || '—'; };
        setModal('profileModalName', (currentUser.firstName || '') + ' ' + (currentUser.lastName || ''));
        setModal('profileModalEmail', currentUser.email);
        setModal('profileModalFirst', currentUser.firstName);
        setModal('profileModalLast', currentUser.lastName);
        setModal('profileModalEmail2', currentUser.email);
        setModal('profileModalJoined', joined);

        var genderEl = document.getElementById('profileModalGender');
        if (genderEl) genderEl.textContent = currentUser.gender === 'm' ? 'Male' : currentUser.gender === 'f' ? 'Female' : '—';

        var picEl = document.getElementById('profileModalPic');
        if (picEl) picEl.src = currentUser.gender === 'm' ? '../assets/images/male.png' : '../assets/images/female.png';

    } else {
        authButtons.style.display = 'flex';
        profileDropdown.style.display = 'none';
    }

    updateMobileMenu(isLoggedIn);
}

function updateMobileMenu(isLoggedIn) {
    var mobileAuth = document.getElementById('mobileAuthButtons');
    var mobileProfile = document.getElementById('mobileProfileSection');
    if (!mobileAuth || !mobileProfile) return;

    if (isLoggedIn) {
        mobileAuth.style.display = 'none';
        mobileProfile.style.display = 'block';

        var mobileNameEl = document.getElementById('mobileProfileName');
        if (mobileNameEl) mobileNameEl.textContent = (currentUser.firstName || '') + ' ' + (currentUser.lastName || '');

        var mobileImgEl = document.getElementById('mobileProfileImg');
        if (mobileImgEl) {
            mobileImgEl.src = currentUser.gender === 'm'
                ? '../assets/images/male.png'
                : '../assets/images/female.png';
        }
    } else {
        mobileAuth.style.display = 'flex';
        mobileProfile.style.display = 'none';
    }

    // Wire mobile logout button (only once)
    var mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn && !mobileLogoutBtn._bound) {
        mobileLogoutBtn.addEventListener('click', function () {
            logout();
        });
        mobileLogoutBtn._bound = true;
    }
}

updateNavbar(currentUser.isLoggedIn);

// ─── Profile dropdown toggle ─────────────────────────────────────────────────
var profileTrigger = document.getElementById('profileTrigger');
var profileDropdownMenu = document.getElementById('profileDropdownMenu');

if (profileTrigger && profileDropdownMenu) {
    profileTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = profileDropdownMenu.classList.contains('open');
        profileDropdownMenu.classList.toggle('open', !isOpen);
    });

    document.addEventListener('click', function() {
        profileDropdownMenu.classList.remove('open');
    });

    profileDropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// ─── Sign out buttons ────────────────────────────────────────────────────────
var navLogoutBtn = document.getElementById('navLogoutBtn');
if (navLogoutBtn) navLogoutBtn.addEventListener('click', window.handleLogout);

var profileModalSignOut = document.getElementById('profileModalSignOut');
if (profileModalSignOut) profileModalSignOut.addEventListener('click', window.handleLogout);

if (logoutBtn) logoutBtn.addEventListener('click', window.handleLogout);

// ─── ✅ Redirect intent: where did the user want to go? ───────────────────────
// Set when user clicks a protected link while not logged in.
// Cleared after redirect or on manual login/register without intent.
let redirectAfterLogin = null;

// ─── GUARD: only pages with navbar modals run this block ──────────────────────
if (loginBtn !== null && registerBtn !== null) {

    const loginModal = document.getElementById('loginModal');
    const loginModalInstance = new bootstrap.Modal(loginModal);

    const registerModal = document.getElementById('registerModal');
    const registerModalInstance = new bootstrap.Modal(registerModal);

    const assetsBtn = document.getElementById('assetsBtn');
    const manageAssetsBtn = document.getElementById('manageAssetsBtn');
    const redirectToSignUp = document.getElementById('redirectToSignUp');
    const redirectToSignIn = document.getElementById('redirectToSignIn');
    const xBtn = document.querySelectorAll('.xBtn');

    // ── Navbar buttons ────────────────────────────────────────────────────────
    loginBtn.addEventListener('click', () => {
        redirectAfterLogin = null; // manual login — no redirect intent
        loginModalInstance.show();
    });

    registerBtn.addEventListener('click', () => {
        redirectAfterLogin = null; // manual register — no redirect intent
        registerModalInstance.show();
    });
    // handle logout — handled globally above

    // ── ✅ My Assets link (navbar) — save intent then show modal ─────────────
    assetsBtn?.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentUser.isLoggedIn) {
            window.location.href = "../html/myAssets.html";
        } else {
            redirectAfterLogin = "../html/myAssets.html"; // ← save destination
            loginModalInstance.show();
        }
    });

    // ── ✅ My Assets link (mobile menu) — same logic ─────────────────────────
    const mobileAssetsBtn = document.getElementById('mobileAssetsBtn');
    mobileAssetsBtn?.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentUser.isLoggedIn) {
            window.location.href = "../html/myAssets.html";
        } else {
            redirectAfterLogin = "../html/myAssets.html";
            loginModalInstance.show();
        }
    });

    // ── ✅ Manage Assets CTA (hero section) — same logic ─────────────────────
    manageAssetsBtn?.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentUser.isLoggedIn) {
            window.location.href = "../html/myAssets.html";
        } else {
            redirectAfterLogin = "../html/myAssets.html"; // ← save destination
            loginModalInstance.show();
        }
    });

    // ── ✅ "Manage Your Assets (bottom section of index.html) ──────────
    document.getElementById('manageAssetsBtn2')?.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentUser.isLoggedIn) {
            window.location.href = "../html/myAssets.html";
        } else {
            redirectAfterLogin = "../html/myAssets.html";
            loginModalInstance.show();
        }
    });

    // ── Close buttons — clear intent if user dismisses ───────────────────────
    xBtn.forEach(btn => btn.addEventListener('click', () => {
        redirectAfterLogin = null; // user cancelled — clear intent
        loginModalInstance.hide();
        registerModalInstance.hide();
    }));

    // ✅ Clear intent if user dismisses modal by clicking backdrop
    loginModal.addEventListener('hidden.bs.modal', () => {
        redirectAfterLogin = null;
    });
    registerModal.addEventListener('hidden.bs.modal', () => {
        redirectAfterLogin = null;
    });

    // ── Switch between modals — keep intent alive ─────────────────────────────
    redirectToSignUp?.addEventListener('click', () => {
        loginModalInstance.hide();
        registerModalInstance.show();
        // redirectAfterLogin stays set — user is still trying to reach assets
    });

    redirectToSignIn?.addEventListener('click', () => {
        registerModalInstance.hide();
        loginModalInstance.show();
        // redirectAfterLogin stays set
    });

    // ── ✅ Helper: called after successful login or register ──────────────────
    function onAuthSuccess() {
        updateNavbar(true);
        if (redirectAfterLogin !== null) {
            const dest = redirectAfterLogin;
            redirectAfterLogin = null;          // clear before redirecting
            window.location.href = dest;        // ← go to assets page
        }
    }

    // ── Register form ─────────────────────────────────────────────────────────
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let users = getUsers();
        const newUser = { firstName: "", lastName: "", email: "", gender: "", password: "" };
        const formData = new FormData(this);
        let isValid = true;

        const errorFirst = document.getElementById("error-fName");
        const errorLast = document.getElementById("error-lName");
        const errorEmail = document.getElementById("error-registerEmail");
        const errorConfirmEmail = document.getElementById("error-confirmEmail");
        const errorGender = document.getElementById("error-gender");
        const errorPassword = document.getElementById("error-registerPassword");
        const errorConfirmPassword = document.getElementById("error-confirmPassword");

        const fName = formData.get("fName").trim();
        const lName = formData.get("lName").trim();
        const email = formData.get("email").trim();
        const cEmail = formData.get("confirmEmail").trim();
        const gender = formData.get("gender");
        const password = formData.get("password");
        const cPassword = formData.get("confirmPassword");

        const namePattern = /^[A-Za-z]+$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordPattern = /^[A-Z](?=.*(?:\d.*){2,})(?=.*[!@#$%^&*(),.?":{}|<>]).{7,31}$/;

        [errorFirst, errorLast, errorEmail, errorConfirmEmail,
            errorGender, errorPassword, errorConfirmPassword]
            .forEach(el => el.textContent = "");

        if (fName.length === 0) {
            errorFirst.textContent = "First name is required.";
            isValid = false;
        } else if (!namePattern.test(fName)) {
            errorFirst.textContent = "Only letters.";
            isValid = false;
        } else { newUser.firstName = fName; }

        if (lName.length === 0) {
            errorLast.textContent = "Last name is required.";
            isValid = false;
        } else if (!namePattern.test(lName)) {
            errorLast.textContent = "Only letters.";
            isValid = false;
        } else { newUser.lastName = lName; }

        if (email.length === 0) {
            errorEmail.textContent = "Email is required.";
            isValid = false;
        } else if (!emailPattern.test(email)) {
            errorEmail.textContent = "Please enter a valid email.";
            isValid = false;
        } else if (checkEmailExists(email)) {
            errorEmail.textContent = "Email already exists.";
            isValid = false;
        } else if (email !== cEmail) {
            errorConfirmEmail.textContent = "Emails do not match.";
            isValid = false;
        } else { newUser.email = email; }

        if (gender === null) {
            errorGender.textContent = "Please select your gender.";
            isValid = false;
        } else { newUser.gender = gender; }

        if (password.length === 0) {
            errorPassword.textContent = "Password is required.";
            isValid = false;
        } else if (!passwordPattern.test(password)) {
            errorPassword.textContent = "Password must start with a capital letter, contain at least 2 numbers, at least 1 special character, and be between 8 and 32 characters.";
            isValid = false;
        } else if (cPassword.length === 0) {
            errorConfirmPassword.textContent = "Please confirm your password.";
            isValid = false;
        } else if (cPassword !== password) {
            errorConfirmPassword.textContent = "Passwords do not match.";
            isValid = false;
        } else { newUser.password = sha256(password); }

        if (isValid) {
            newUser.password = sha256(password);
            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));

            currentUser.email = newUser.email;
            currentUser.firstName = newUser.firstName;
            currentUser.lastName = newUser.lastName;
            currentUser.gender = newUser.gender;
            currentUser.isLoggedIn = true;

            sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
            registerForm.reset();
            registerModalInstance.hide();
            onAuthSuccess(); // ✅ redirect if intent exists
        }
    });

    // ── Login form ────────────────────────────────────────────────────────────
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        let isValid = true;
        const errorEmail = document.getElementById("error-loginEmail");
        const errorPassword = document.getElementById("error-loginPassword");
        const email = formData.get("loginEmail").trim();
        const password = formData.get("loginPassword");
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        errorEmail.textContent = "";
        errorPassword.textContent = "";

        if (email.length === 0) {
            errorEmail.textContent = "Email is required.";
            isValid = false;
        } else if (!emailPattern.test(email)) {
            errorEmail.textContent = "Please enter a valid email.";
            isValid = false;
        } else if (!checkEmailExists(email)) {
            errorEmail.textContent = "No account found with this email.";
            isValid = false;
        }

        if (password.length === 0) {
            errorPassword.textContent = "Password is required.";
            isValid = false;
        }

        if (isValid) {
            const users = getUsers();
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (user !== undefined && user.password === sha256(password)) {
                currentUser.email = user.email;
                currentUser.firstName = user.firstName;
                currentUser.lastName = user.lastName;
                currentUser.gender = user.gender;
                currentUser.isLoggedIn = true;

                sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
                loginForm.reset();
                loginModalInstance.hide();
                onAuthSuccess(); // ✅ redirect if intent exists
            } else {
                errorPassword.textContent = "Incorrect password.";
            }
        }
    });

} // ─── end of navbar guard ────────────────────────────────────────────────────