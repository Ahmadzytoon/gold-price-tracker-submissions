const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

if (!currentUser) {
  alert("Please login first ❌");
  window.location.href = "Login.html";
}

function updateHeader() {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));
  const loginLink = document.querySelector('[data-auth="login-link"]');
  const registerItem = document.querySelector('[data-auth="register-item"]');
  const hello = document.querySelector('[data-auth="greeting"]');

  if (!loginLink) return;

  if (user) {
    loginLink.textContent = "Logout";
    loginLink.href = "#";
    loginLink.onclick = function (e) {
      e.preventDefault();
      sessionStorage.removeItem("currentUser");
      window.location.href = "index.html";
    };

    if (registerItem) registerItem.style.display = "none";
    if (hello) {
      hello.style.display = "block";
      hello.textContent = "Hi, " + (user.username || user.email || "User");
    }
  } else {
    loginLink.textContent = "Login";
    loginLink.href = "Login.html";
    loginLink.onclick = null;
    if (registerItem) registerItem.style.display = "";
    if (hello) hello.style.display = "none";
  }
}

function getAssetsKey() {
  return "assets_" + currentUser.id;
}

function getAssets() {
  const data = localStorage.getItem(getAssetsKey());
  return data ? JSON.parse(data) : [];
}

function saveAssets(assets) {
  localStorage.setItem(getAssetsKey(), JSON.stringify(assets));
}

function money(num) {
  return "$" + Number(num || 0).toFixed(2);
}

function getCurrentGoldPrice() {
  const price = Number(localStorage.getItem("goldPrice"));
  if (!price || isNaN(price)) return null;
  return price;
}

function calcCurrentPrice(weight, karat) {
  const ouncePrice = getCurrentGoldPrice();
  if (!ouncePrice) return null;

  const gram24 = ouncePrice / 31.1035;
  const gramPrice = gram24 * (Number(karat) / 24);
  return gramPrice * Number(weight);
}

function deleteAsset(id) {
  let assets = getAssets();
  assets = assets.filter(function (a) {
    return a.id !== id;
  });
  saveAssets(assets);
  renderAssets();
}

function renderAssets(filteredAssets) {
  const grid = document.getElementById("assetsGrid");
  const totalBalanceEl = document.getElementById("totalBalance");
  const totalChangeEl = document.getElementById("totalChange");

  if (!grid) return;

  const assets = filteredAssets || getAssets();
  grid.innerHTML = "";

  let totalCurrentValue = 0;
  let totalProfitLoss = 0;

  if (!assets.length) {
    grid.innerHTML = "<p>No assets yet</p>";
    if (totalBalanceEl) totalBalanceEl.innerText = "$0.00";
    if (totalChangeEl) {
      totalChangeEl.textContent = "No profit / loss yet";
      totalChangeEl.className = "";
    }
    return;
  }

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const buyPrice = Number(asset.buyPrice || asset.price || 0);
    const currentValue = calcCurrentPrice(asset.weight, Number(asset.karat));
    const safeCurrentValue = Number.isFinite(currentValue)
      ? currentValue
      : buyPrice;
    const profitLoss = safeCurrentValue - buyPrice;
    const isProfit = profitLoss >= 0;

    totalCurrentValue += safeCurrentValue;
    totalProfitLoss += profitLoss;

    grid.innerHTML += `
      <div class="col-lg-4 col-md-6">
        <div class="asset-square-card position-relative">
          <button onclick="deleteAsset(${asset.id})" class="btn btn-sm btn-danger position-absolute bottom-0 end-0 m-3">Delete</button>

          <div class="d-flex justify-content-between align-items-start gap-2">
            <div style="font-size: 1.5rem;">📀</div>
            <span class="karat-badge">${asset.karat}K</span>
          </div>

          <div class="mt-3">
            <h5 class="mb-1 fw-bold">${asset.name}</h5>
            <p class="small mb-1">${asset.weight}g</p>
            <p class="small mb-0">Buy date: ${asset.buyDate || "N/A"}</p>
          </div>

          <div class="mt-3">
            <p class="small mb-1">Buy Price: ${money(buyPrice)}</p>
            ${asset.suggestedBuyPrice ? `<p class="small mb-1">Suggested Price: ${money(asset.suggestedBuyPrice)}</p>` : ""}
            <p class="small mb-1">Current Value: ${money(safeCurrentValue)}</p>
            <h6 class="m-0 ${isProfit ? "profit" : "loss"}">
              ${isProfit ? "▲ Profit" : "▼ Loss"}: ${money(Math.abs(profitLoss))}
            </h6>
          </div>
        </div>
      </div>
    `;
  }

  if (totalBalanceEl) {
    totalBalanceEl.innerText = money(totalCurrentValue);
  }

  if (totalChangeEl) {
    totalChangeEl.textContent = `${totalProfitLoss >= 0 ? "▲ Total Profit" : "▼ Total Loss"}: ${money(Math.abs(totalProfitLoss))}`;
    totalChangeEl.className = totalProfitLoss >= 0 ? "profit" : "loss";
  }
}

const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const value = this.value.trim().toLowerCase();
    const assets = getAssets();
    const filteredAssets = assets.filter(function (asset) {
      return (
        asset.name.toLowerCase().includes(value) ||
        String(asset.karat).includes(value) ||
        String(asset.buyDate || "").includes(value)
      );
    });

    renderAssets(filteredAssets);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  updateHeader();
  renderAssets();
});
