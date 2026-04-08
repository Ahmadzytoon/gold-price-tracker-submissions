// ============================================================
// autho.js — Login/Register page UI logic (uses Auth module)
// ============================================================

// ── Flip card ────────────────────────────────────────────────
const FLIP_CARD = () => {
    const card = document.getElementById("card");
    card.classList.toggle("flipped");
    card.style.minHeight = card.classList.contains("flipped") ? "48rem" : "37.5rem";
};

// ── Validation helpers ───────────────────────────────────────
const validateName = (name, errEl) => {
    errEl.textContent = "";
    if (!name) { errEl.textContent = "Required field"; return false; }
    const errs = [];
    if (!/^[A-Za-z\s]+$/.test(name)) errs.push("Only letters allowed");
    if (name.length < 4) errs.push("Must be at least 4 characters");
    if (errs.length) { errEl.innerHTML = errs.join("<br>"); return false; }
    return true;
};

const validateEmail = (email, errEl) => {
    errEl.textContent = "";
    if (!email) { errEl.textContent = "Required field"; return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = "Email not valid"; return false; }
    return true;
};

const validatePass = (pass, errEl) => {
    errEl.textContent = "";
    if (!pass) { errEl.textContent = "Required field"; return false; }
    const errs = [];
    if (pass.length < 8 || pass.length > 16) errs.push("Password must be 8–16 characters");
    if (!/[A-Z]/.test(pass)) errs.push("At least one uppercase letter");
    if (!/\d/.test(pass)) errs.push("At least one number");
    if (errs.length) { errEl.innerHTML = errs.join("<br>"); return false; }
    return true;
};

const validateConfirm = (confirm, pass, errEl) => {
    errEl.textContent = "";
    if (!confirm) { errEl.textContent = "Required field"; return false; }
    if (confirm !== pass) { errEl.textContent = "Passwords do not match"; return false; }
    return true;
};

// ── Register ─────────────────────────────────────────────────
document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const name    = document.getElementById("fullName").value.trim();
    const email   = document.getElementById("regEmail").value.trim();
    const pass    = document.getElementById("regPass").value.trim();
    const confirm = document.getElementById("confirmPass").value.trim();

    const nameErr    = document.getElementById("fullName-error");
    const emailErr   = document.getElementById("regEmail-error");
    const passErr    = document.getElementById("regPass-error");
    const confirmErr = document.getElementById("confirmPass-error");

    const ok = [
        validateName(name, nameErr),
        validateEmail(email, emailErr),
        validatePass(pass, passErr),
        validateConfirm(confirm, pass, confirmErr),
    ].every(Boolean);

    if (!ok) return;

    const result = Auth.register(name, email, pass);
    if (!result.ok) { emailErr.textContent = result.msg; return; }

    alert("Registered successfully! Please log in.");
    e.target.reset();
    FLIP_CARD();
});

// ── Login ────────────────────────────────────────────────────
document.getElementById("logForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("logEmail").value.trim();
    const pass  = document.getElementById("logPass").value.trim();
    const emailErr = document.getElementById("logEmail-error");
    const passErr  = document.getElementById("logPass-error");
    emailErr.textContent = "";
    passErr.textContent = "";

    if (!validateEmail(email, emailErr)) return;
    if (!pass) { passErr.textContent = "Required field"; return; }

    const result = Auth.login(email, pass);
    if (!result.ok) {
        if (result.field === "email") emailErr.textContent = result.msg;
        else passErr.textContent = result.msg;
        return;
    }

    alert(`Welcome back, ${result.user.name}!`);
    e.target.reset();
    window.location.href = "assets.html";
});

// ── Forgot password ──────────────────────────────────────────
document.getElementById("forgotPass").addEventListener("click", (e) => {
    e.preventDefault();
    const email = prompt("Enter your registered email:");
    if (!email) return;
    const result = Auth.resetPassword(email);
    alert(result.ok ? "Password updated successfully." : result.msg);
});
