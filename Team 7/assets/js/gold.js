// ============================================================
// gold.js — Gold Price, Currency & localStorage helpers
// ============================================================

const Gold = (() => {

    // ── Exchange rate (USD → JOD) ────────────────────────────
    const USD_TO_JOD = 0.709; // 1 USD ≈ 0.709 JOD (fixed; update as needed)
    let _currency = localStorage.getItem("currency") || "USD"; // "USD" | "JOD"

    const getCurrency = () => _currency;
    const setCurrency = (c) => { _currency = c; localStorage.setItem("currency", c); };
    const toggleCurrency = () => { setCurrency(_currency === "USD" ? "JOD" : "USD"); };
    const convert = (usd) => _currency === "JOD" ? usd * USD_TO_JOD : usd;
    const fmt = (usd, decimals = 2) => {
        const val = convert(usd);
        return `${val.toFixed(decimals)} ${_currency}`;
    };
    const fmtRaw = (usd, decimals = 2) => convert(usd).toFixed(decimals);

    // ── Price calculations ───────────────────────────────────
    const getPrices = (oz) => {
        const g24 = oz / 31.1035;
        return {
            Ounce: oz,
            Bar: oz,
            "24K": g24,
            "22K": g24 * (22 / 24),
            "21K": g24 * (21 / 24),
            "18K": g24 * (18 / 24),
            EnglishLira: g24 * 0.9167 * 8,
            RashadiLira: g24 * 0.9167 * 7.2,
        };
    };

    const getAssetPriceKey = (type, karat) => {
        if (type === "Bar") return "Bar";
        if (type === "EnglishLira") return "EnglishLira";
        if (type === "RashadiLira") return "RashadiLira";
        return karat;
    };

    const getDiff = (current, previous) => {
        if (!previous || previous === 0) return { diff: 0, pct: "0.00", cls: "trend-flat", arrow: "▬" };
        const diff = current - previous;
        const pct = ((diff / previous) * 100).toFixed(2);
        return {
            diff: parseFloat(diff.toFixed(2)),
            pct,
            cls: diff > 0 ? "trend-up" : diff < 0 ? "trend-down" : "trend-flat",
            txtCls: diff > 0 ? "text-success" : diff < 0 ? "text-danger" : "text-secondary",
            arrow: diff > 0 ? "▲" : diff < 0 ? "▼" : "▬",
        };
    };

    const buildPnl = (currentVal, purchasePrice) => {
        const diff = currentVal - parseFloat(purchasePrice);
        const pct = (diff / parseFloat(purchasePrice)) * 100;
        return diff >= 0
            ? { html: `+${fmt(diff)} (${pct.toFixed(2)}%)`, cls: "profit-bg" }
            : { html: `-${fmt(Math.abs(diff))} (${Math.abs(pct).toFixed(2)}%)`, cls: "loss-bg" };
    };

    // ── localStorage price cache ─────────────────────────────
    // Stores up to 10 {price, time} points for chart seeding
    const HISTORY_KEY = "gold_price_history";

    const getHistory = () => JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    const pushHistory = (price) => {
        const history = getHistory();
        const last = localStorage.getItem("gold_price");
        if (last) localStorage.setItem("gold_prev_price", last);
        localStorage.setItem("gold_price", price);
        localStorage.setItem("gold_time", Date.now());

        history.push({ price, time: Date.now() });
        if (history.length > 10) history.shift();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    };

    const getCached = () => {
        const price = localStorage.getItem("gold_price");
        if (!price) return null;
        return {
            price: parseFloat(price),
            prevPrice: parseFloat(localStorage.getItem("gold_prev_price") || price),
            time: parseInt(localStorage.getItem("gold_time")) || 0,
        };
    };

    // ── API fetch ────────────────────────────────────────────
    const fetchPrice = async () => {
        const res = await fetch("https://api.gold-api.com/price/XAU");
        const data = await res.json();
        return data.price;
    };

    return { getCurrency, setCurrency, toggleCurrency, convert, fmt, fmtRaw, getPrices, getAssetPriceKey, getDiff, buildPnl, getHistory, pushHistory, getCached, fetchPrice };
})();
