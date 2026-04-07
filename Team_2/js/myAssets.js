/**
 * GoldVault Portfolio Management System
 * Fixed: Sign Out, Currency Toggle, Portfolio Summary (live prices), Asset Cards (profit/loss)
 */

// ── GLOBALS ──────────────────────────────────────────────────────────────────
const assetUser     = JSON.parse(sessionStorage.getItem('currentUser'));
const selectImg     = document.getElementById('profilePic');
const USD_TO_JOD    = 0.709;
const TROY_OZ_TO_G  = 31.1035;

let currentCurrency     = 'USD';
let currentOzPriceUSD   = 0;

// ── AUTH GUARD ───────────────────────────────────────────────────────────────
if (!assetUser || !assetUser.isLoggedIn) {
    window.location.href = '../html/index.html';
}

// ── SIGN OUT ──────────────────────────────────────────────────────────────────
document.querySelectorAll('.sign-out-link, [data-action="signout"]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('currentUser');
        window.location.href = '../html/index.html';
    });
});

document.querySelectorAll('a.dropdown-item.text-danger').forEach(el => {
    if (el.textContent.trim().toLowerCase().includes('sign out')) {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = '../html/index.html';
        });
    }
});

// ── CURRENCY TOGGLE ───────────────────────────────────────────────────────────
function setCurrency(cur) {
    currentCurrency = cur;

    // Update all toggle buttons
    document.querySelectorAll('.toggle-btn, .ctoggle').forEach(function(btn) {
        btn.classList.remove('active');
    });

    // Set active on matched buttons
    document.querySelectorAll('.toggle-btn, .ctoggle').forEach(function(btn) {
        if (btn.textContent.trim() === cur) {
            btn.classList.add('active');
        }
    });

    if (currentOzPriceUSD > 0) {
        updatePortfolioSummary(getUserAssets());
        renderInventory(getUserAssets());
        refreshTicker();
    }
}

// ── PRICE HELPERS ─────────────────────────────────────────────────────────────
function gramPrice(ozUSD, karat) {
    return (ozUSD / TROY_OZ_TO_G) * (karat / 24);
}

function toDisplay(usdVal) {
    if (currentCurrency === 'JOD') return usdVal * USD_TO_JOD;
    return usdVal;
}

function formatMoney(usdVal, decimals = 2) {
    const sym = currentCurrency === 'JOD' ? 'JOD' : 'USD';
    return `${toDisplay(usdVal).toFixed(decimals)} ${sym}`;
}

// ── ASSET IMAGE MAP ───────────────────────────────────────────────────────────
function getAssetImage(type, category) {
    if (type === 'Bars')            return '../assets/bars/gold-bar.png';
    if (category === 'Rashadi')     return '../assets/coins/rashadi_coin.png';
    if (category === 'English')     return '../assets/coins/english_coin.png';
    if (category === 'Necklace')    return '../assets/jewelry/necklace.png';
    if (category === 'Anklet')      return '../assets/jewelry/anklet.png';
    if (category === 'Belt')        return '../assets/jewelry/belt.png';
    if (category === 'Ring')        return '../assets/jewelry/ring.png';
    if (category === 'Watch')       return '../assets/jewelry/watch.png';
    return '../assets/images/gold-jewelry.png';
}

// ── KARAT LABEL ───────────────────────────────────────────────────────────────
function karatNum(karatStr) {
    return parseInt(karatStr) || 21;
}

// ── CURRENT VALUE OF AN ASSET ─────────────────────────────────────────────────
function getCurrentValueUSD(asset) {
    if (currentOzPriceUSD === 0) return 0;

    const RASHADI_G = 6.494;
    const ENGLISH_G = 7.322;

    if (asset.category === 'Rashadi') {
        return gramPrice(currentOzPriceUSD, 21.6) * RASHADI_G;
    }
    if (asset.category === 'English') {
        return gramPrice(currentOzPriceUSD, 22) * ENGLISH_G;
    }

    const weight = parseFloat(asset.weight) || 0;
    const karat  = karatNum(asset.karat);
    return gramPrice(currentOzPriceUSD, karat) * weight;
}

// ── USER ASSETS FROM LOCALSTORAGE ────────────────────────────────────────────
function getUserAssets() {
    const key = `assets_${assetUser.email}`;
    return JSON.parse(localStorage.getItem(key)) || [];
}

// ── UPDATE USER INFO (name, avatar) ──────────────────────────────────────────
function updateUserInfo() {
    document.querySelectorAll('.fullName').forEach(el => {
        el.innerText = `${assetUser.firstName} ${assetUser.lastName}`;
    });

    const headerTitle = document.querySelector('h1.serif');
    if (headerTitle) {
        headerTitle.innerHTML = `${assetUser.firstName}'s Gold <em>Overview</em>`;
    }

    if (selectImg) {
        selectImg.src = assetUser.gender === 'm'
            ? '../assets/images/male.png'
            : '../assets/images/female.png';
    }
}

// ── PORTFOLIO SUMMARY (top cards) ────────────────────────────────────────────
function updatePortfolioSummary(assets) {
    const summary = {
        '24K': 0, '21K': 0, '18K': 0,
        Rashadi: { total: 0, count: 0 },
        English: { total: 0, count: 0 },
        Bars: 0
    };

    assets.forEach(asset => {
        const val = getCurrentValueUSD(asset);

        if (asset.type === 'Bars') {
            summary.Bars += val;
        } else if (asset.category === 'Rashadi') {
            summary.Rashadi.total += val;
            summary.Rashadi.count++;
        } else if (asset.category === 'English') {
            summary.English.total += val;
            summary.English.count++;
        } else {
            const k = asset.karat;
            if (summary[k] !== undefined) summary[k] += val;
        }
    });

    const mapping = [
        { id: 'totalValue24',      val: summary['24K'],        selector: '.karat24' },
        { id: 'totalValue21',      val: summary['21K'],        selector: '.karat21' },
        { id: 'totalValue18',      val: summary['18K'],        selector: '.karat18' },
        { id: 'totalValueBars',    val: summary.Bars,          selector: '.bar-card' },
        { id: 'totalValueRashadi', val: summary.Rashadi.total, selector: '.coin-card:nth-of-type(4)', countId: 'countRashadi', count: summary.Rashadi.count },
        { id: 'totalValueEnglish', val: summary.English.total, selector: '.coin-card:nth-of-type(5)', countId: 'countEnglish', count: summary.English.count }
    ];

    mapping.forEach(item => {
        const card = document.querySelector(item.selector);
        if (!card) return;

        if (item.val > 0) {
            card.classList.remove('d-none');
            document.getElementById(item.id).innerText = formatMoney(item.val);
            if (item.countId) {
                document.getElementById(item.countId).innerText = `${item.count} Coins Owned`;
            }
        } else {
            card.classList.add('d-none');
        }
    });
}

// ── RENDER ASSET CARDS ────────────────────────────────────────────────────────
function renderInventory(assets) {
    const grid = document.getElementById('assetInventoryGrid');
    grid.innerHTML = '';

    if (assets.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center my-5 text-muted">
                <h5>No assets secured yet.</h5>
                <p>Click "Secure New Asset" to add your first gold holding.</p>
            </div>`;
        return;
    }

    assets.forEach(asset => {
        const imgSrc        = getAssetImage(asset.type, asset.category);
        const buyPriceJOD   = parseFloat(asset.buyPrice) || 0;
        const currentValUSD = getCurrentValueUSD(asset);

        const buyPriceUSDEquiv = buyPriceJOD / USD_TO_JOD;
        const profitUSD = currentValUSD - buyPriceUSDEquiv;
        const profitPct = buyPriceUSDEquiv > 0
            ? ((profitUSD / buyPriceUSDEquiv) * 100).toFixed(1)
            : 0;

        const isProfit    = profitUSD >= 0;
        const profitClass = isProfit ? 'bg-profit' : 'bg-loss';
        const valueColor  = isProfit ? 'text-success' : 'text-danger';
        const borderStyle = isProfit ? '' : 'border-left: 4px solid var(--loss-red) !important;';
        const profitSign  = isProfit ? '+' : '-';
        const profitLabel = isProfit ? 'Profit' : 'Loss';

        const label = asset.category
            ? `${asset.category} | ${asset.karat}`
            : `${asset.type} | ${asset.karat}`;

        const cardHtml = `
        <div class="col-md-4 col-lg-3">
            <article class="asset-item-card position-relative" style="${borderStyle} cursor:pointer;" onclick="openAssetDetail(${asset.id})">
                <span class="profit-indicator ${profitClass}">
                    ${profitSign}${Math.abs(profitPct)}%
                </span>
                <div class="asset-card-image-wrapper">
                    <img src="${imgSrc}" alt="Asset" class="asset-card-image">
                </div>
                <div class="asset-card-body">
                    <div class="mb-2">
                        <span class="badge rounded-pill bg-light text-dark border">${label}</span>
                    </div>
                    <h6 class="fw-bold mb-1">${asset.description || 'Gold Asset'}</h6>
                    <p class="text-muted small mb-0">Weight: ${asset.weight}g | Date: ${asset.date}</p>
                    <p class="text-muted small mb-1">Buy Price: ${formatMoney(buyPriceUSDEquiv)}</p>
                    <div class="mt-auto pt-3 border-top">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="text-muted small">Current Value:</span>
                            <span class="fw-bold ${valueColor} fs-5">${formatMoney(currentValUSD)}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">P&amp;L:</span>
                            <span class="fw-semibold ${valueColor} small">
                                ${profitSign}${formatMoney(Math.abs(profitUSD))}
                                &nbsp;·&nbsp; ${profitLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </article>
        </div>`;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// ── FORM SUBMISSION ───────────────────────────────────────────────────────────
document.getElementById('assetForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const storageKey = `assets_${assetUser.email}`;
    const userAssets = JSON.parse(localStorage.getItem(storageKey)) || [];

    const typeVal = document.getElementById('typeSelect').value;

    const karatSelect = document.querySelector('#addAssetModal .modal-body select.form-select:nth-of-type(2)');
    const karatVal = karatSelect ? karatSelect.value : '21K';

    const categoryVal = typeVal === 'Jewelry'
        ? document.getElementById('jewelryCategory').value
        : typeVal === 'Coins'
            ? document.getElementById('coinCategory').value
            : '';

    const priceInputs = document.querySelectorAll('#addAssetModal input[step="0.01"]');

    const newAsset = {
        id:          Date.now(),
        type:        typeVal,
        karat:       karatVal,
        category:    categoryVal,
        buyPrice:    priceInputs[0]?.value || 0,
        weight:      priceInputs[1]?.value || 0,
        date:        document.getElementById('purchaseDate').value,
        description: document.querySelector('#addAssetModal input[placeholder*="e.g."]')?.value || ''
    };

    userAssets.push(newAsset);
    localStorage.setItem(storageKey, JSON.stringify(userAssets));

    this.reset();
    bootstrap.Modal.getInstance(document.getElementById('addAssetModal'))?.hide();
    renderInventory(getUserAssets());
    updatePortfolioSummary(getUserAssets());
});

// ── TOGGLE FORM FIELDS ────────────────────────────────────────────────────────
function toggleFormFields() {
    const type = document.getElementById('typeSelect').value;
    document.getElementById('jewelryOptions').style.display = type === 'Jewelry' ? 'block' : 'none';
    document.getElementById('coinOptions').style.display    = type === 'Coins'   ? 'block' : 'none';
}

// ── SEARCH / FILTER ───────────────────────────────────────────────────────────
function applyFilters() {
    const filterSection = document.querySelector('.filter-section');
    if (!filterSection) return;

    const searchVal = filterSection.querySelector('input[type="text"]')?.value.toLowerCase() || '';
    const typeVal   = filterSection.querySelectorAll('select')[0]?.value || 'all';
    const karatVal  = filterSection.querySelectorAll('select')[1]?.value || 'all';

    let assets = getUserAssets();

    if (searchVal) {
        assets = assets.filter(a =>
            (a.description || '').toLowerCase().includes(searchVal) ||
            (a.type        || '').toLowerCase().includes(searchVal) ||
            (a.karat       || '').toLowerCase().includes(searchVal) ||
            (a.category    || '').toLowerCase().includes(searchVal)
        );
    }

    if (typeVal !== 'all') assets = assets.filter(a => a.type === typeVal);
    if (karatVal !== 'all') assets = assets.filter(a => a.karat === karatVal);

    renderInventory(assets);
}

function attachFilterListeners() {
    const filterSection = document.querySelector('.filter-section');
    if (!filterSection) return;
    filterSection.querySelector('input[type="text"]')?.addEventListener('input', applyFilters);
    filterSection.querySelectorAll('select').forEach(s => s.addEventListener('change', applyFilters));
}

// ── MOBILE MENU TOGGLE ────────────────────────────────────────────────────────
document.getElementById('navToggle')?.addEventListener('click', function () {
    document.getElementById('mobileMenu')?.classList.toggle('open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('#mobileMenu a').forEach(function (link) {
    link.addEventListener('click', function () {
        document.getElementById('mobileMenu')?.classList.remove('open');
    });
});

// ── LIVE PRICE FETCH ──────────────────────────────────────────────────────────
function fetchAndRefresh() {
    const GOLD_API_URL = 'https://api.gold-api.com/price/XAU';
    fetch(GOLD_API_URL)
        .then(r => r.json())
        .then(data => {
            if (data && data.price) {
                currentOzPriceUSD = parseFloat(data.price);
            } else {
                currentOzPriceUSD = currentOzPriceUSD || 3050;
            }
        })
        .catch(() => {
            currentOzPriceUSD = currentOzPriceUSD || 3050;
        })
        .finally(() => {
            updatePortfolioSummary(getUserAssets());
            renderInventory(getUserAssets());
            refreshTicker();
        });
}

function refreshTicker() {
    const oz = currentOzPriceUSD;
    if (!oz) return;

    const g24     = oz / TROY_OZ_TO_G;
    const g21     = g24 * (21 / 24);
    const g18     = g24 * (18 / 24);
    const rashadi = g24 * 6.494;
    const english = g24 * 7.322;
    const isJOD   = currentCurrency === 'JOD';
    const sym     = isJOD ? 'JOD' : 'USD';

    function fmt(val, dec = 2) {
        return (isJOD ? val * USD_TO_JOD : val).toFixed(dec) + ' ' + sym;
    }

    const items = [
        'XAU/oz: '  + fmt(oz),
        '24K/g: '   + fmt(g24),
        '21K/g: '   + fmt(g21),
        '18K/g: '   + fmt(g18),
        'Rashadi: ' + fmt(rashadi),
        'English: ' + fmt(english),
        '1kg Bar: ' + fmt(g24 * 1000, 0),
    ];

    const track = document.getElementById('tickerTrack');
    if (track) track.innerHTML = [...items, ...items]
        .map(t => `<span class="ticker-item">🪙 ${t}</span>`)
        .join('');
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function initApp() {
    updateUserInfo();
    attachFilterListeners();

    const dateInput = document.getElementById('purchaseDate');
    if (dateInput) dateInput.max = new Date().toISOString().split('T')[0];

    // عبّي الـ profile modal كل مرة يتفتح
    document.getElementById('profileModal')?.addEventListener('show.bs.modal', function () {
        const assets = getUserAssets();

        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
        setVal('profileModalName',   `${assetUser.firstName} ${assetUser.lastName}`);
        setVal('profileModalEmail',   assetUser.email);
        setVal('profileModalFirst',   assetUser.firstName);
        setVal('profileModalLast',    assetUser.lastName);
        setVal('profileModalEmail2',  assetUser.email);
        setVal('profileModalGender',  assetUser.gender === 'm' ? 'Male' : 'Female');
        setVal('profileModalJoined',  assetUser.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        setVal('profileModalCount',   String(assets.length));

        const picEl = document.getElementById('profileModalPic');
        if (picEl) picEl.src = assetUser.gender === 'm' ? '../assets/images/male.png' : '../assets/images/female.png';

        const totalJOD = assets.reduce((sum, a) => sum + (getCurrentValueUSD(a) * USD_TO_JOD), 0);
        setVal('profileModalValue', totalJOD.toFixed(0));
    });

    updatePortfolioSummary(getUserAssets());
    renderInventory(getUserAssets());
    fetchAndRefresh();
    setInterval(fetchAndRefresh, 60000);
}

document.addEventListener('DOMContentLoaded', initApp);

// ── ASSET DETAIL MODAL ───────────────────────────────────────────────────────
let selectedAssetId = null;

function openAssetDetail(assetId) {
    const assets = getUserAssets();
    const asset  = assets.find(a => a.id === assetId);
    if (!asset) return;

    selectedAssetId = assetId;

    const buyUSD     = parseFloat(asset.buyPrice) / USD_TO_JOD;
    const currentUSD = getCurrentValueUSD(asset);
    const profitUSD  = currentUSD - buyUSD;
    const profitPct  = buyUSD > 0 ? ((profitUSD / buyUSD) * 100).toFixed(1) : 0;
    const isProfit   = profitUSD >= 0;
    const sign       = isProfit ? '+' : '';

    document.getElementById('detailImg').src             = getAssetImage(asset.type, asset.category);
    document.getElementById('detailName').textContent    = asset.description || 'Gold Asset';
    document.getElementById('detailBadge').textContent   = `${asset.category || asset.type} · ${asset.karat}`;
    document.getElementById('detailWeight').textContent  = `${asset.weight} g`;
    document.getElementById('detailKarat').textContent   = asset.karat;
    document.getElementById('detailBuyPrice').textContent   = formatMoney(buyUSD);
    document.getElementById('detailCurrentVal').textContent = formatMoney(currentUSD);
    document.getElementById('detailCurrentVal').style.color = isProfit ? '#27ae60' : '#e74c3c';
    document.getElementById('detailDate').textContent    = asset.date;

    const pnlBar = document.getElementById('detailPnlBar');
    const pnlVal = document.getElementById('detailPnlVal');
    pnlBar.style.background = isProfit ? 'rgba(39,174,96,0.08)' : 'rgba(231,76,60,0.08)';
    pnlBar.style.border     = isProfit ? '1px solid rgba(39,174,96,0.2)' : '1px solid rgba(231,76,60,0.2)';
    pnlVal.style.color      = isProfit ? '#27ae60' : '#e74c3c';
    pnlVal.textContent      = `${sign}${formatMoney(Math.abs(profitUSD))} · ${sign}${profitPct}%`;

    new bootstrap.Modal(document.getElementById('assetDetailModal')).show();
}

function deleteAsset(assetId) {
    const key  = `assets_${assetUser.email}`;
    let assets = getUserAssets();
    assets     = assets.filter(a => a.id !== assetId);
    localStorage.setItem(key, JSON.stringify(assets));

    bootstrap.Modal.getInstance(document.getElementById('assetDetailModal'))?.hide();
    updatePortfolioSummary(getUserAssets());
    renderInventory(getUserAssets());
    refreshTicker();
}

document.getElementById('deleteAssetBtn')?.addEventListener('click', () => {
    if (!selectedAssetId) return;

    const confirmed = confirm('Are you sure you want to delete this asset?\nThis action cannot be undone.');
    if (confirmed) {
        deleteAsset(selectedAssetId);
        alert('✅ The asset was successfully deleted.');
    }
});