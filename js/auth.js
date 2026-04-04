const loginForm = document.getElementById("loginForm");

function showToast(message, type = "error") {//default value
    const existing = document.getElementById("kiraty-toast");
    if (existing) existing.remove(); // no conflict

    const toast = document.createElement("div");
    toast.id = "kiraty-toast"; // نعطيه id 
    toast.textContent = message;

    const isSuccess = type === "success";
    Object.assign(toast.style, {
        //object.assign عشان ندمج  الستايل مع بعض
        position: "fixed", // عنصر يثبت في شاشة لا يتحرك  
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

    requestAnimationFrame(() => { //built-in function
        
        toast.style.opacity = "1"; // يظهر
        toast.style.transform = "translateY(0)";

    });

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => toast.remove(), 
        400); // delet 
    }, 3500);
}

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const email    = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user  = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("currentUser", email); //حفظ المستخدم الحالي
            showToast("Welcome back! Redirecting...", "success");
            setTimeout(() => { window.location.href = "/index.html"; }, 1500);
        } else {
            showToast("Invalid email or password.");
        }
    });
}
