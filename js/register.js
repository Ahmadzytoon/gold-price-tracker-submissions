const registerForm = document.getElementById("registerForm");

function showToast(message, type = "error") {//default value
    const existing = document.getElementById("kiraty-toast");
    if (existing) existing.remove(); // اذا كان موجود شيله

    const toast = document.createElement("div");
    toast.id = "kiraty-toast";
    toast.textContent = message;

    const isSuccess = type === "success";
    Object.assign(toast.style, { //خobject.assign : يدمج اكثر من ستايل 
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: "9999",
        padding: "14px 24px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "600",
        letterSpacing: "0.5px",
        color: isSuccess ? "#000" : "#fff",
        background: isSuccess
            ? "linear-gradient(135deg, #D4AF37, #B8860B)"
            : "rgba(200, 50, 50, 0.92)",
        border: isSuccess
            ? "1px solid #D4AF37"
            : "1px solid rgba(255,80,80,0.5)",
        boxShadow: isSuccess
            ? "0 6px 24px rgba(212,175,55,0.35)"
            : "0 6px 24px rgba(200,50,50,0.3)",
        backdropFilter: "blur(8px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: "0",
        transform: "translateY(20px)",
        fontFamily: "'Abel', sans-serif",
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => { 
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

 if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const email    = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const confirm  = document.getElementById("regConfirm").value;
        const phone    = document.getElementById("regPhone").value.trim();

        if (password !== confirm) {
            showToast("Passwords do not match");
            return;
        }

        if (!email || !password || !phone) { 
            showToast("Please fill in all fields");
            return;
        }

        if (password.length < 5) {
            showToast("Password must be at least 5 characters");
            return;
        }

        if (phone.length < 9) {
            showToast("Phone number must be at least 9 digits");
            return;
        }

        const users  = JSON.parse(localStorage.getItem("users") || "[]"); // string to arrey
        const exists = users.find(u => u.email === email);

        if (exists) {
            showToast("This email is already registered");
            setTimeout(() => { window.location.href = "login.html"; }, 2000);
            return;
        }

        users.push({ email, password, phone });
        localStorage.setItem("users", JSON.stringify(users));

        showToast("Account created! Redirecting to login...", "success");
        setTimeout(() => { window.location.href = "login.html"; }, 2000);
    });
}
