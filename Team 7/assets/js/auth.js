// ============================================================
// auth.js — Authentication & Session Management
// ============================================================

const Auth = (() => {

    // ── Storage helpers ──────────────────────────────────────
    const getUsers = () => JSON.parse(localStorage.getItem("users")) || {};
    const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users));

    const getCurrentUser = () => {
        try { return JSON.parse(localStorage.getItem("currentUser")) || null; }
        catch { return null; }
    };
    const setCurrentUser = (user) => localStorage.setItem("currentUser", JSON.stringify(user));
    const clearCurrentUser = () => localStorage.removeItem("currentUser");

    // ── User-scoped asset storage ────────────────────────────
    const getUserAssets = (email) => {
        const users = getUsers();
        return users[email]?.assets || [];
    };
    const saveUserAssets = (email, assets) => {
        const users = getUsers();
        if (!users[email]) users[email] = {};
        users[email].assets = assets;
        saveUsers(users);
    };

    // ── Auth actions ─────────────────────────────────────────
    const register = (name, email, password) => {
        const users = getUsers();
        if (users[email]) return { ok: false, msg: "Email already registered" };
        users[email] = { name, email, password, assets: [] };
        saveUsers(users);
        return { ok: true };
    };

    const login = (email, password) => {
        const users = getUsers();
        const user = users[email];
        if (!user) return { ok: false, field: "email", msg: "Email not found" };
        if (user.password !== password) return { ok: false, field: "pass", msg: "Incorrect password" };
        setCurrentUser({ name: user.name, email: user.email });
        return { ok: true, user };
    };

    const logout = () => {
        clearCurrentUser();
        window.location.href = getBasePath() + "index.html";
    };

    // ── Helpers ──────────────────────────────────────────────
    const getInitials = (name) => {
        if (!name) return "?";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getBasePath = () => {
        const path = window.location.pathname;
        return path.includes("/pages/") ? "../" : "";
    };

    // ── Render nav auth state ────────────────────────────────
    const renderNavAuth = () => {
        const btn = document.getElementById("authBtn");
        if (!btn) return;
        const user = getCurrentUser();
        if (user) {
            const initials = getInitials(user.name);
            btn.outerHTML = `
                <div class="d-flex align-items-center gap-2">
                    <div class="user-avatar" title="${user.name}">${initials}</div>
                    <button class="logBtn fw-semibold btn" id="logoutBtn" onclick="Auth.logout()">Log out</button>
                </div>`;
        } else {
            btn.className = "logBtn fw-semibold text-dark btn";
            btn.textContent = "Log in";
        }
    };

    // ── Password reset ───────────────────────────────────────
    const resetPassword = (email) => {
        const users = getUsers();
        if (!users[email]) return { ok: false, msg: "Email not found" };
        const newPass = prompt("Enter new password:");
        if (!newPass) return { ok: false, msg: "Cancelled" };
        users[email].password = newPass;
        saveUsers(users);
        return { ok: true };
    };

    return { register, login, logout, getCurrentUser, getInitials, renderNavAuth, getUserAssets, saveUserAssets, resetPassword };
})();
