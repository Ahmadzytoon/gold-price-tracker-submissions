// ============================================================
// home.js — Homepage logic (chart, rates, news)
// ============================================================

// ── Chart ────────────────────────────────────────────────────
let goldChart;
const chartLabels = [];
const chartData = [];

const initChart = () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const gridColor = isLight ? "#eeeeee" : "#222";
    const textColor = isLight ? "#555" : "#666";
    const ctx = document.getElementById("goldChart")?.getContext("2d");
    if (!ctx) return;

    // Seed chart with stored history (up to last 8 points)
    const history = Gold.getHistory();
    const seed = history.slice(-8);
    seed.forEach(pt => {
        const label = new Date(pt.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        chartLabels.push(label);
        chartData.push(Gold.convert(pt.price));
    });

    goldChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [...chartLabels],
            datasets: [{
                data: [...chartData],
                borderColor: "#d4af37",
                borderWidth: 2.5,
                fill: true,
                backgroundColor: "rgba(212, 175, 55, 0.08)",
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "#d4af37",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: "index" },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(20,20,20,0.95)",
                    borderColor: "#d4af37",
                    borderWidth: 1,
                    titleColor: "#d4af37",
                    bodyColor: "#fff",
                    callbacks: { label: ctx => ` ${parseFloat(ctx.parsed.y).toFixed(2)} ${Gold.getCurrency()}` }
                }
            },
            scales: {
                y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => `${parseFloat(v).toFixed(0)} ${Gold.getCurrency()}` } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });
};

const updateChartTheme = () => {
    if (!goldChart) return;
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    goldChart.options.scales.y.grid.color = isLight ? "#eeeeee" : "#222";
    goldChart.options.scales.y.ticks.color = isLight ? "#555" : "#666";
    goldChart.options.scales.x.ticks.color = isLight ? "#555" : "#666";
    goldChart.update();
};

const addChartPoint = (priceUsd) => {
    const label = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const val = Gold.convert(priceUsd);
    if (chartLabels.length >= 20) { chartLabels.shift(); chartData.shift(); }
    chartLabels.push(label);
    chartData.push(val);
    if (goldChart) {
        goldChart.data.labels = [...chartLabels];
        goldChart.data.datasets[0].data = [...chartData];
        goldChart.update("none");
    }
};

// Rebuild chart data with current currency
const rebuildChartCurrency = () => {
    if (!goldChart) return;
    const history = Gold.getHistory().slice(-8);
    goldChart.data.labels = history.map(pt =>
        new Date(pt.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    goldChart.data.datasets[0].data = history.map(pt => Gold.convert(pt.price));
    goldChart.options.scales.y.ticks.callback = v => `${parseFloat(v).toFixed(0)} ${Gold.getCurrency()}`;
    goldChart.options.plugins.tooltip.callbacks.label = ctx => ` ${parseFloat(ctx.parsed.y).toFixed(2)} ${Gold.getCurrency()}`;
    goldChart.update();
};

// ── UI updater ───────────────────────────────────────────────
const updateUI = (curr, prev) => {
    const prices = Gold.getPrices(curr);
    const prevPrices = Gold.getPrices(prev);

    // Hero
    const heroVal = document.getElementById("hero-price-val");
    if (heroVal) heroVal.textContent = Gold.fmtRaw(curr);

    const heroCurrLabel = document.getElementById("hero-currency");
    if (heroCurrLabel) heroCurrLabel.textContent = Gold.getCurrency();

    const heroChange = Gold.getDiff(curr, prev);
    const heroEl = document.getElementById("hero-change");
    if (heroEl) {
        heroEl.textContent = `${heroChange.arrow} ${Gold.fmtRaw(Math.abs(heroChange.diff))} ${Gold.getCurrency()} (${Math.abs(heroChange.pct)}%) from last fetch`;
        heroEl.className = `hero-change ${heroChange.diff >= 0 ? "up" : "down"}`;
    }

    const statEnglish = document.getElementById("stat-english");
    if (statEnglish) statEnglish.textContent = Gold.fmt(prices["EnglishLira"]);
    const statRashadi = document.getElementById("stat-rashadi");
    if (statRashadi) statRashadi.textContent = Gold.fmt(prices["RashadiLira"]);
    const statTime = document.getElementById("stat-time");
    if (statTime) statTime.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Rate cards helper
    const renderRate = (id, trendId, val, prevVal) => {
        const el = document.getElementById(id);
        if (!el) return;
        const d = Gold.getDiff(val, prevVal);
        el.innerHTML = `${Gold.fmtRaw(val)}<span class="rate-card-currency">${Gold.getCurrency()}</span>`;
        const tEl = document.getElementById(trendId);
        if (tEl) { tEl.textContent = `${d.arrow} ${Math.abs(d.pct)}%`; tEl.className = d.cls; }
    };

    renderRate("rate-24k",     "trend-24k",     prices["24K"],         prevPrices["24K"]);
    renderRate("rate-21k",     "trend-21k",     prices["21K"],         prevPrices["21K"]);
    renderRate("rate-18k",     "trend-18k",     prices["18K"],         prevPrices["18K"]);
    renderRate("rate-22k",     "trend-22k",     prices["22K"],         prevPrices["22K"]);
    renderRate("rate-english", "trend-english", prices["EnglishLira"], prevPrices["EnglishLira"]);
    renderRate("rate-rashadi", "trend-rashadi", prices["RashadiLira"], prevPrices["RashadiLira"]);

    addChartPoint(curr);
};

// ── Currency toggle ──────────────────────────────────────────
const updateCurrencyBtn = () => {
    const btn = document.getElementById("currency-toggle");
    if (btn) btn.textContent = Gold.getCurrency() === "USD" ? "Switch to JOD" : "Switch to USD";
};

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("currency-toggle");
    if (btn) {
        updateCurrencyBtn();
        btn.addEventListener("click", () => {
            Gold.toggleCurrency();
            updateCurrencyBtn();
            const cached = Gold.getCached();
            if (cached) updateUI(cached.price, cached.prevPrice);
            rebuildChartCurrency();
        });
    }
});

// ── Gold price fetching ──────────────────────────────────────
const fetchAndUpdate = async () => {
    try {
        const price = await Gold.fetchPrice();
        Gold.pushHistory(price);
        window.currentGoldPrice = price;
        const cached = Gold.getCached();
        updateUI(cached.price, cached.prevPrice);
    } catch (err) {
        console.error("Gold fetch error:", err.message);
        const cached = Gold.getCached();
        if (cached) updateUI(cached.price, cached.prevPrice);
    }
};

// ── News ─────────────────────────────────────────────────────
const GNEWS_KEY = "38871b063c70928836fc12f8b2ab101c";

const FALLBACK_NEWS = [
    { title: "Gold surges amid global economic uncertainty", source: { name: "Reuters" }, publishedAt: new Date(Date.now() - 1800000).toISOString(), url: "#" },
    { title: "Central banks increase gold reserves to record highs", source: { name: "Bloomberg" }, publishedAt: new Date(Date.now() - 7200000).toISOString(), url: "#" },
    { title: "XAU/USD holds strong above key support level", source: { name: "FX Street" }, publishedAt: new Date(Date.now() - 10800000).toISOString(), url: "#" },
    { title: "Fed rate decision expected to impact gold demand", source: { name: "CNBC" }, publishedAt: new Date(Date.now() - 18000000).toISOString(), url: "#" },
    { title: "Inflation concerns drive investors toward safe-haven assets", source: { name: "MarketWatch" }, publishedAt: new Date(Date.now() - 25200000).toISOString(), url: "#" },
];

const timeAgo = (iso) => {
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60000);
    const h = Math.floor(min / 60);
    if (min < 2) return "LIVE";
    if (min < 60) return `${min}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const renderNews = (articles) => {
    const container = document.getElementById("news-container");
    if (!container) return;
    container.innerHTML = "";
    articles.forEach((article, i) => {
        const t = timeAgo(article.publishedAt);
        const isLive = t === "LIVE";
        const div = document.createElement("div");
        div.className = "news-item";
        div.innerHTML = `
            <p class="news-item-title">${article.title}</p>
            <div class="news-item-meta">
                <span class="news-source">${article.source?.name || "News"}</span>
                <span class="${isLive ? "news-badge badge-live" : i === 0 ? "news-badge badge-new" : "news-time"}">${t}</span>
            </div>`;
        if (article.url && article.url !== "#") div.addEventListener("click", () => window.open(article.url, "_blank"));
        container.appendChild(div);
    });
};

const fetchNews = async () => {
    if (!GNEWS_KEY || GNEWS_KEY === "YOUR_GNEWS_API_KEY") { renderNews(FALLBACK_NEWS); return; }
    try {
        const res = await fetch(`https://gnews.io/api/v4/search?q=gold+price+XAU&lang=en&max=8&apikey=${GNEWS_KEY}`);
        const data = await res.json();
        renderNews(data.articles?.length ? data.articles : FALLBACK_NEWS);
    } catch { renderNews(FALLBACK_NEWS); }
};

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // Apply saved currency toggle label
    updateCurrencyBtn();

    // Init chart (seeds from localStorage history)
    initChart();

    // Immediate render from cache
    const cached = Gold.getCached();
    if (cached) {
        window.currentGoldPrice = cached.price;
        updateUI(cached.price, cached.prevPrice);
    }

    // Fetch fresh price
    const isStale = !cached || (Date.now() - cached.time > 6 * 60 * 1000);
    if (isStale) fetchAndUpdate();

    // Poll every 60s
    setInterval(() => {
        const c = Gold.getCached();
        if ((!c || Date.now() - c.time > 6 * 60 * 1000) && document.visibilityState === "visible") fetchAndUpdate();
    }, 60000);

    // Theme changes → update chart
    document.addEventListener("themeChanged", updateChartTheme);

    fetchNews();
});
