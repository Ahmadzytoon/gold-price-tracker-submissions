let allAssets = [];

async function startAssetsPage() {
  requireAuth();
  await fetchGoldPrice();
  allAssets = getAssets();
  renderAssets(allAssets);

  setInterval(async function () {
    await fetchGoldPrice();
    renderAssets(filterAssets());
  }, UPDATE_INTERVAL);
}

function renderAssets(assets) {
  let container = document.getElementById("assets-container");
  container.innerHTML = "";

  if (assets.length === 0) {
    container.innerHTML = "<p class='text-center  mt-4'>No assets yet. Add your first one!</p>";
    return;
  }

  assets.forEach(function (asset) {
    let card = createAssetCard(asset);
    container.appendChild(card);
  });
}

function createAssetCard(asset) {
  let gramPrice = getKaratPrice(asset.karat);
  let currentValue = gramPrice * asset.weight;
  let profit = currentValue - asset.purchasePrice;
  let profitPercent = ((profit / asset.purchasePrice) * 100).toFixed(2);
  let isProfit = profit >= 0;

  let col = document.createElement("div");
  col.className = "col-md-4 col-sm-6 mb-4";

  col.innerHTML = `
    <div class="card asset-card h-100">
      <img src="${asset.image || "assets/images/placeholder-asset.png"}" class="card-img-top asset-img" alt="${asset.category}">
      <div class="card-body">
        <h5 class="card-title">${asset.category}</h5>
        <p class="card-text  mb-1">Type: ${asset.type}</p>
        <p class="card-text  mb-1">Karat: ${asset.karat}K</p>
        <p class="card-text  mb-1">Weight: ${asset.weight}g</p>
        <p class="card-text  mb-1">Purchased: ${asset.purchaseDate}</p>
        <hr>
        <p class="card-text">Purchase Price: <strong>$${asset.purchasePrice}</strong></p>
        <p class="card-text">Current Value: <strong>${formatPrice(currentValue)}</strong></p>
        <p class="card-text ${isProfit ? "text-success" : "text-danger"}">
          ${isProfit ? "▲ Profit" : "▼ Loss"}: ${formatPrice(Math.abs(profit))} (${profitPercent}%)
        </p>
      </div>
      <div class="card-footer">
        <button class="btn btn-sm btn-danger w-100" onclick="deleteAsset('${asset.id}')">Delete</button>
      </div>
    </div>
  `;

  return col;
}

function addAsset() {
  let type = document.getElementById("asset-type").value;
  let karat = document.getElementById("asset-karat").value;
  let category = document.getElementById("asset-category").value;
  let weight = document.getElementById("asset-weight").value;
  let purchasePrice = document.getElementById("asset-purchase-price").value;
  let purchaseDate = document.getElementById("asset-purchase-date").value;
  let file = document.getElementById("asset-image").files[0];

  if (!type || !karat || !category || !weight || !purchasePrice || !purchaseDate) {
    alert("Please fill in all fields.");
    return;
  }

  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      saveNewAsset(type, karat, category, weight, purchasePrice, purchaseDate, e.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    saveNewAsset(type, karat, category, weight, purchasePrice, purchaseDate, "");
  }
}

function saveNewAsset(type, karat, category, weight, purchasePrice, purchaseDate, image) {
  let newAsset = {
    id: Date.now().toString(),
    type,
    karat,
    category,
    weight: parseFloat(weight),
    purchasePrice: parseFloat(purchasePrice),
    purchaseDate,
    image,
  };

  allAssets = getAssets();
  allAssets.push(newAsset);
  saveAssets(allAssets);

  document.getElementById("add-asset-form").reset();
  let modal = bootstrap.Modal.getInstance(document.getElementById("addAssetModal"));
  modal.hide();

  renderAssets(allAssets);
}

function deleteAsset(id) {
  if (!confirm("Are you sure you want to delete this asset?")) return;

  allAssets = allAssets.filter(function (a) {
    return a.id !== id;
  });
  saveAssets(allAssets);
  renderAssets(filterAssets());
}

function filterAssets() {
  let search = document.getElementById("search-input").value.toLowerCase();
  let typeFilter = document.getElementById("filter-type").value;
  let karatFilter = document.getElementById("filter-karat").value;

  return allAssets.filter(function (asset) {
    let matchSearch = asset.category.toLowerCase().includes(search);
    let matchType = typeFilter === "" || asset.type === typeFilter;
    let matchKarat = karatFilter === "" || asset.karat === karatFilter;
    return matchSearch && matchType && matchKarat;
  });
}

function applyFilters() {
  renderAssets(filterAssets());
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

window.onload = function () {
  updateNavbar();
  startAssetsPage();

  document.getElementById("search-input").addEventListener("input", applyFilters);
  document.getElementById("filter-type").addEventListener("change", applyFilters);
  document.getElementById("filter-karat").addEventListener("change", applyFilters);
  document.getElementById("save-asset-btn").addEventListener("click", addAsset);
  document.getElementById("nav-logout").addEventListener("click", logout);
};
