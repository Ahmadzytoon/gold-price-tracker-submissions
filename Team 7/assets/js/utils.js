// ============================================================
// utils.js — Shared UI utilities (preloader, theme, nav)
// ============================================================

// ── Preloader ────────────────────────────────────────────────
window.addEventListener("load", () => {
    const el = document.getElementById("preloader");
    if (el) setTimeout(() => el.classList.add("preloader-hidden"), 1000);
});

// ── Active nav link ──────────────────────────────────────────
document.querySelectorAll(".page").forEach(link => {
    const linkPage = link.getAttribute("href").split("/").pop();
    const currPage = window.location.pathname.split("/").pop() || "index.html";
    if (linkPage === currPage) link.classList.add("active");
    else link.classList.remove("active");
});

// ── Theme ────────────────────────────────────────────────────
const HTML_EL = document.documentElement;
const saved = localStorage.getItem("theme");
if (saved) HTML_EL.setAttribute("data-theme", saved);

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
    themeToggle.addEventListener("click", (e) => {
        e.preventDefault();
        const next = HTML_EL.getAttribute("data-theme") === "light" ? "dark" : "light";
        HTML_EL.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        // Notify pages that care (chart etc.)
        document.dispatchEvent(new CustomEvent("themeChanged", { detail: next }));
    });
}

// ── Auth nav render (depends on auth.js loaded first) ────────
document.addEventListener("DOMContentLoaded", () => {
    if (typeof Auth !== "undefined") Auth.renderNavAuth();
});
