async function startPricesPage() {
  await fetchGoldPrice();
  updateAllPrices();

  setInterval(async function() {
    await fetchGoldPrice();
    updateAllPrices();
  }, UPDATE_INTERVAL);
}

function updateAllPrices() {
  document.getElementById("price-24k").textContent = formatPrice(getKaratPrice("24"));
  document.getElementById("price-21k").textContent = formatPrice(getKaratPrice("21"));
  document.getElementById("price-18k").textContent = formatPrice(getKaratPrice("18"));
  document.getElementById("price-rashadi").textContent = formatPrice(getCoinPrice("rashadi"));
  document.getElementById("price-english").textContent = formatPrice(getCoinPrice("english"));
  document.getElementById("price-bar").textContent = formatPrice(getBarPrice());
  document.getElementById("price-ounce").textContent = formatPrice(currentOuncePrice);

  let timeEls = document.querySelectorAll(".last-updated");
  timeEls.forEach(function(el) {

  });
}

function toggleCurrency(btn) {
  if (currentCurrency === "USD") {
    currentCurrency = "JOD";
    btn.textContent = "JOD";
  } else {
    currentCurrency = "USD";
    btn.textContent = "USD";
  }
  updateAllPrices();
}

function updateNavbar() {
  let user = getCurrentUser();
  let login = document.getElementById("nav-login");
  let logoutBtn = document.getElementById("nav-logout");
  let uname = document.getElementById("nav-username");

  if (user) {
    if (login) login.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (uname) {
      uname.style.display = "inline-flex";
      uname.style.alignItems = "center";
      uname.style.gap = "8px";
      uname.style.background = "rgba(201, 138, 106, 0.1)";
      uname.style.padding = "6px 14px";
      uname.style.borderRadius = "20px";
      uname.style.border = "1px solid rgba(201, 138, 106, 0.2)";
      uname.style.transition = "all 0.3s ease";

      uname.innerHTML = `<span class="fw-medium text-white" style="letter-spacing: 0.5px; font-size: 13px;">${user.name}</span>`;

      uname.onmouseover = function() {
        this.style.background = "rgba(201, 138, 106, 0.2)";
        this.style.borderColor = "var(--gold)";
      };
      uname.onmouseout = function() {
        this.style.background = "rgba(201, 138, 106, 0.1)";
        this.style.borderColor = "rgba(201, 138, 106, 0.2)";
      };
    }
  }
}

window.onload = function() {
  updateNavbar();
  startPricesPage();

  let btn = document.getElementById("currency-toggle");
  btn.addEventListener("click", function() { toggleCurrency(btn); });

  document.getElementById("nav-logout").addEventListener("click", logout);
};
