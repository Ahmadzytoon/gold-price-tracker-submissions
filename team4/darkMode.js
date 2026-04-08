
(function () {
 
  const LIGHT_LOGO = "/media/logo.png";
  const DARK_LOGO  = "/media/darklogo.png";
 
  // ── 1. Apply saved theme IMMEDIATELY (no flash) ──
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
 
  // ── Swap logo src based on current theme ──
  function updateLogo() {
    const logo = document.querySelector(".logo img");
    if (!logo) return;
    logo.src = document.body.classList.contains("dark-mode") ? DARK_LOGO : LIGHT_LOGO;
  }
 
  // ── 2. Wire up the toggle button ──
  function attachToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn || btn._darkModeAttached) return;
    btn._darkModeAttached = true;
 
    const icon  = btn.querySelector(".toggle-icon");
    const label = btn.querySelector(".toggle-label");
 
    syncBtn(icon, label);
    updateLogo(); // sync logo on load
 
    btn.addEventListener("click", () => {
      if (document.body.classList.contains("dark-mode")) {
        applyLight(icon, label);
      } else {
        applyDark(icon, label);
      }
    });
  }
 
  function syncBtn(icon, label) {
    if (document.body.classList.contains("dark-mode")) {
      icon.textContent  = "☀️";
      label.textContent = "Light";
    } else {
      icon.textContent  = "🌙";
      label.textContent = "Dark";
    }
  }
 
  function applyDark(icon, label) {
    document.body.classList.add("dark-mode");
    icon.textContent  = "☀️";
    label.textContent = "Light";
    localStorage.setItem("theme", "dark");
    updateLogo();
  }
 
  function applyLight(icon, label) {
    document.body.classList.remove("dark-mode");
    icon.textContent  = "🌙";
    label.textContent = "Dark";
    localStorage.setItem("theme", "light");
    updateLogo();
  }
 
  document.addEventListener("DOMContentLoaded", () => {
    attachToggle();
 
    const placeholder = document.getElementById("header-placeholder");
    if (!placeholder) return;
 
    const observer = new MutationObserver(() => {
      attachToggle();
    });
    observer.observe(placeholder, { childList: true, subtree: true });
  });
 
})();