// ============================================================
// assets.js — My Assets page logic
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ── Guard: redirect if not logged in ─────────────────────
    // (optional — comment out if you want public access)
    // const user = Auth.getCurrentUser();
    // if (!user) { window.location.href = "login-register.html"; return; }

    const ASSETS_FORM   = document.getElementById("addAssetForm");
    const ROW_CARD      = document.getElementById("rowCard");
    const IMG_INPUT     = document.getElementById("asset-img");
    const IMG_PREVIEW   = document.getElementById("img-preview");
    const ADD_CARD      = document.querySelector(".add-asset-card");

    if (!ASSETS_FORM || !ROW_CARD) return;

    // ── User-scoped storage ──────────────────────────────────
    // Auth is checked only when Add Asset card is clicked.
    window.__assetsUserEmail = null;
    window.__assetsList = [];

    const loadAssets = () => window.__assetsList || [];
    const persistAssets = (assets) => {
        window.__assetsList = assets;
        if (window.__assetsUserEmail) Auth.saveUserAssets(window.__assetsUserEmail, assets);
    };

    // ── Add asset card click auth check (ONLY HERE) ─────────
    if (ADD_CARD) {
        // Prevent Bootstrap from auto-opening modal before auth check.
        ADD_CARD.removeAttribute("data-bs-toggle");
        ADD_CARD.removeAttribute("data-bs-target");

        ADD_CARD.addEventListener("click", (e) => {
            e.preventDefault();

            const user = Auth.getCurrentUser();
            if (!user) {
                window.location.href = "login-register.html";
                return;
            }

            window.__assetsUserEmail = user.email;
            window.__assetsList = Auth.getUserAssets(user.email) || [];

            // Re-render cards for this logged-in user.
            document.querySelectorAll('#rowCard > [id^="asset-"]').forEach(el => el.remove());
            window.__assetsList.forEach(displayCard);
            filterAssets();

            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("addAssetModal"));
            modal.show();
        });
    }

    // ── Image preview ────────────────────────────────────────
    let currentBase64 = "";
    IMG_INPUT?.addEventListener("change", () => {
        const file = IMG_INPUT.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            currentBase64 = e.target.result;
            if (IMG_PREVIEW) { IMG_PREVIEW.src = currentBase64; IMG_PREVIEW.style.display = "block"; }
        };
        reader.readAsDataURL(file);
    });

    // ── Form submit — add asset ──────────────────────────────
    ASSETS_FORM.addEventListener("submit", (e) => {
        e.preventDefault();
        const asset = {
            id: Date.now(),
            name:  document.getElementById("assetName").value,
            type:  document.getElementById("assetType").value,
            karat: document.getElementById("assetKarat").value,
            date:  document.getElementById("purchaseDate").value,
            price: document.getElementById("purchasePrice").value,
            gram:  document.getElementById("gram").value,
            image: currentBase64,
        };
        const assets = loadAssets();
        assets.push(asset);
        persistAssets(assets);
        displayCard(asset);

        // Reset form
        ASSETS_FORM.reset();
        currentBase64 = "";
        if (IMG_PREVIEW) { IMG_PREVIEW.src = ""; IMG_PREVIEW.style.display = "none"; }
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("addAssetModal"));
        modal.hide();
    });

    // ── No auth check on boot; page remains public ──────────

    // ── Currency toggle ──────────────────────────────────────
    const currBtn = document.getElementById("currency-toggle");
    if (currBtn) {
        updateCurrencyBtn();
        currBtn.addEventListener("click", () => {
            Gold.toggleCurrency();
            updateCurrencyBtn();
            updateAllPnl();
            updateAsideDisplay();
        });
    }

    // ── Aside live rates ─────────────────────────────────────
    updateAsideDisplay();
    const cached = Gold.getCached();
    if (cached) window.currentGoldPrice = cached.price;

    // Fetch fresh gold price
    const fetchAndRefresh = async () => {
        try {
            const price = await Gold.fetchPrice();
            Gold.pushHistory(price);
            window.currentGoldPrice = price;
            updateAsideDisplay();
            updateAllPnl();
        } catch (err) { console.error("Gold fetch error:", err.message); }
    };

    const isStale = !cached || (Date.now() - cached.time > 6 * 60 * 1000);
    if (isStale) fetchAndRefresh();
    setInterval(() => {
        const c = Gold.getCached();
        if ((!c || Date.now() - c.time > 6 * 60 * 1000) && document.visibilityState === "visible") fetchAndRefresh();
    }, 60000);

    // ── Search & filter ──────────────────────────────────────
    document.getElementById("search-input")?.addEventListener("input", filterAssets);
    document.getElementById("types")?.addEventListener("change", filterAssets);
    document.getElementById("karat")?.addEventListener("change", filterAssets);
});

// ── Display a card ───────────────────────────────────────────
function displayCard(asset) {
    const ROW_CARD = document.getElementById("rowCard");
    if (!ROW_CARD) return;
    if (document.getElementById(`asset-${asset.id}`)) return; // avoid duplicates

    const currentPrice = window.currentGoldPrice;
    let pnlHTML = "Calculating...";
    let pnlClass = "";

    if (currentPrice) {
        const prices = Gold.getPrices(currentPrice);
        const key = Gold.getAssetPriceKey(asset.type, asset.karat);
        const unitPrice = prices[key] ?? prices["24K"];
        const currentVal = (asset.type === "Bar" || asset.type === "EnglishLira" || asset.type === "RashadiLira")
            ? unitPrice
            : unitPrice * (parseFloat(asset.gram) || 1);
        const pnl = Gold.buildPnl(currentVal, asset.price);
        pnlHTML = pnl.html;
        pnlClass = pnl.cls;
    }

    const card = `
    <div class="col-12 col-md-6 col-lg-4 mb-4" id="asset-${asset.id}">
        <div class="asset-card text-center rounded-4 pb-3 position-relative h-100"
             data-type="${asset.type}" data-karat="${asset.karat}"
             data-purchase-price="${asset.price}" data-gram="${asset.gram || 1}">
            <button onclick="deleteAsset(${asset.id})"
                class="btn btn-sm btn-outline-danger position-absolute end-0 top-0 m-2 border-0">✕</button>
            <div class="img-placeholder mx-auto mb-3 d-flex align-items-center justify-content-center">
                <img src="${asset.image}" class="img-fluid fit-object-cover" alt="Asset">
            </div>
            <p class="custom-text-white fw-semibold mb-0 fs-5">${asset.name}</p>
            <p class="text-gold small">${asset.type} | ${asset.karat} Fine Gold</p>
            <div class="pnl-box d-flex justify-content-around align-items-center px-2 py-3 w-75 m-auto rounded-3 mb-2">
                <div class="pnl-item text-gold small">
                    <span class="d-block mb-2">Bought At</span>
                    <strong class="custom-text-white">${asset.date}</strong>
                </div>
                <div class="pnl-item text-gold small">
                    <span class="d-block mb-2">Bought Price</span>
                    <strong class="custom-text-white">${Gold.fmt(parseFloat(asset.price))}</strong>
                </div>
            </div>
            <div class="pnl-indicator ${pnlClass} w-75 m-auto p-2 rounded d-flex align-items-center justify-content-center"
                 id="pnl-${asset.id}">${pnlHTML}</div>
        </div>
    </div>`;
    ROW_CARD.insertAdjacentHTML("beforeend", card);
}

// ── Delete asset ─────────────────────────────────────────────
window.deleteAsset = (id) => {
    if (!confirm("Delete this asset?")) return;
    const assets = (window.__assetsList || []).filter(a => a.id !== id);
    window.__assetsList = assets;
    if (window.__assetsUserEmail) Auth.saveUserAssets(window.__assetsUserEmail, assets);
    document.getElementById(`asset-${id}`)?.remove();
};

// ── Update all PnL indicators ────────────────────────────────
function updateAllPnl() {
    const currentPrice = window.currentGoldPrice;
    if (!currentPrice) return;
    const prices = Gold.getPrices(currentPrice);

    document.querySelectorAll(".asset-card").forEach(card => {
        const wrapper = card.closest('[id^="asset-"]');
        if (!wrapper) return;
        const id = wrapper.id.replace("asset-", "");
        const pnlEl = document.getElementById(`pnl-${id}`);
        if (!pnlEl) return;

        const type = card.dataset.type;
        const karat = card.dataset.karat;
        const pPrice = parseFloat(card.dataset.purchasePrice);
        const gram = parseFloat(card.dataset.gram) || 1;

        const key = Gold.getAssetPriceKey(type, karat);
        const unitPrice = prices[key] ?? prices["24K"];
        const currentVal = (type === "Bar" || type === "EnglishLira" || type === "RashadiLira")
            ? unitPrice : unitPrice * gram;

        const pnl = Gold.buildPnl(currentVal, pPrice);
        pnlEl.className = `pnl-indicator ${pnl.cls} w-75 m-auto p-2 rounded d-flex align-items-center justify-content-center`;
        pnlEl.innerHTML = pnl.html;
    });
}

// ── Aside live market rates ──────────────────────────────────
function updateAsideDisplay() {
    const aside = document.getElementById("aside");
    if (!aside) return;
    const cached = Gold.getCached();
    if (!cached) return;

    const curr = cached.price;
    const prev = cached.prevPrice;
    const prices = Gold.getPrices(curr);
    const prevPrices = Gold.getPrices(prev);

    const items = [
        { name: "Ounce / oz",    price: curr,               prevPrice: prev },
        { name: "English Lira",  price: prices.EnglishLira, prevPrice: prevPrices.EnglishLira },
        { name: "Rashadi Lira",  price: prices.RashadiLira, prevPrice: prevPrices.RashadiLira },
        { name: "24K / gram",    price: prices["24K"],      prevPrice: prevPrices["24K"] },
        { name: "21K / gram",    price: prices["21K"],      prevPrice: prevPrices["21K"] },
        { name: "18K / gram",    price: prices["18K"],      prevPrice: prevPrices["18K"] },
    ];

    aside.innerHTML = items.map(item => {
        const d = Gold.getDiff(item.price, item.prevPrice);
        return `
        <div class="border-bottom border-secondary d-flex justify-content-between align-items-center py-3 px-2">
            <span class="fw-bold ms-3">${item.name}</span>
            <div class="text-end me-3">
                <div class="price">${Gold.fmt(item.price)}</div>
                <small class="${d.txtCls}">${d.arrow} ${Math.abs(d.pct)}%</small>
            </div>
        </div>`;
    }).join("");
}

// ── Currency toggle button label ─────────────────────────────
function updateCurrencyBtn() {
    const btn = document.getElementById("currency-toggle");
    if (btn) btn.textContent = Gold.getCurrency() === "USD" ? "Switch to JOD" : "Switch to USD";
}

// ── Search & Filter ──────────────────────────────────────────
function filterAssets() {
    const search = document.getElementById("search-input")?.value.toLowerCase().trim() || "";
    const typeVal = document.getElementById("types")?.value || "";
    const karatVal = document.getElementById("karat")?.value || "";
    const cards = document.querySelectorAll('#rowCard > [id^="asset-"]');
    let visible = 0;

    cards.forEach(wrapper => {
        const card = wrapper.querySelector(".asset-card");
        if (!card) return;
        const name = wrapper.querySelector(".fw-semibold")?.textContent.toLowerCase() || "";
        const matchSearch = !search || name.includes(search);
        const matchType = !typeVal || typeVal === "All Types" || card.dataset.type === typeVal;
        const matchKarat = !karatVal || karatVal === "All Karats" || card.dataset.karat === karatVal;
        const show = matchSearch && matchType && matchKarat;
        wrapper.style.display = show ? "" : "none";
        if (show) visible++;
    });

    let emptyMsg = document.getElementById("no-results");
    if (visible === 0) {
        if (!emptyMsg) {
            emptyMsg = document.createElement("div");
            emptyMsg.id = "no-results";
            emptyMsg.className = "text-center text-secondary w-100 py-5";
            emptyMsg.innerHTML = `<i class="fa-solid fa-box-open fs-1 mb-3 d-block"></i> No assets match your search.`;
            document.getElementById("rowCard").appendChild(emptyMsg);
        }
        emptyMsg.style.display = "";
    } else if (emptyMsg) emptyMsg.style.display = "none";
}
