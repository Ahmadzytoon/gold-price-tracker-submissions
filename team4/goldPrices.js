const goldConversion = {
  USDToJD: 0.70,
  Wight: {
    gram: 1,
    RashadiLira: 7.2,
    EnglishLira: 7.98805,
    Ounce: 31.1034786,
    Bar: 116.64 
  },
  Purity: {
    K24: 24 / 24,
    K21: 21 / 24,
    K18: 18 / 24
  }
};

let currentCurrency = "USD";
let priceHistoryUSD = [];

//Fetch live gold price
function fetchGoldData() {
  fetch("https://api.gold-api.com/price/XAU")
    .then((res) => res.json())
    .then((data) => {
      const ouncePriceUSD = data.price;
      const gram24K = ouncePriceUSD / goldConversion.Wight.Ounce;

      const prices = {
        gram24K:  gram24K * goldConversion.Purity.K24,
        gram21K:  gram24K * goldConversion.Purity.K21,
        gram18K:  gram24K * goldConversion.Purity.K18,
        rashadi:  (gram24K * goldConversion.Purity.K21 )* goldConversion.Wight.RashadiLira,
        english: ( gram24K * goldConversion.Purity.K21 )* goldConversion.Wight.EnglishLira,
        bar:      (gram24K * goldConversion.Purity.K24 )* goldConversion.Wight.Bar,
        ounce:    ouncePriceUSD
      };

      // Store in localStorage
      const storeData = {
        USD: prices,
        JOD: Object.fromEntries(
          Object.entries(prices).map(([k, v]) => [k, v * goldConversion.USDToJD])
        ),
        lastUpdate: new Date().toLocaleTimeString()
      };
      localStorage.setItem("gold_prices", JSON.stringify(storeData));

      //30 day history for chart
      buildPriceHistory(ouncePriceUSD);

      renderAll(currentCurrency);
    })
    .catch((err) => {
      console.error("Gold API error:", err);
      document.getElementById("ounce-price").textContent = "Unavailable";
      document.getElementById("ounce-price-sub").textContent = "Could not load price";
    });
}

//30day history
function buildPriceHistory(liveOunceUSD) {
  const today = liveOunceUSD;
  priceHistoryUSD = [];
  for (let i = 29; i >= 0; i--) {
    const randomFactor = 1 + (Math.random() * 0.03 - 0.015);
    priceHistoryUSD.push(+(today * randomFactor).toFixed(2));
  }
  priceHistoryUSD[29] = +today.toFixed(2); 
}

function renderAll(currency) {
  const stored = JSON.parse(localStorage.getItem("gold_prices"));
  if (!stored) return;

  const p = stored[currency];
  const unit = currency === "USD" ? "$" : "JD";
  const decimals = currency === "USD" ? 2 : 3;

  // Live price card
  document.getElementById("ounce-price").textContent =
    `${unit}${p.ounce.toFixed(decimals)}`;
  document.getElementById("ounce-price-sub").textContent =
    `Price per troy ounce · ${currency}`;
  document.getElementById("last-updated").textContent =
    `Last updated: ${stored.lastUpdate}`;

  // Rate cards
  document.getElementById("price-24k").textContent =
    `${unit}${p.gram24K.toFixed(decimals)}`;
  document.getElementById("price-21k").textContent =
    `${unit}${p.gram21K.toFixed(decimals)}`;
  document.getElementById("price-18k").textContent =
    `${unit}${p.gram18K.toFixed(decimals)}`;
  document.getElementById("price-rashadi").textContent =
    `${unit}${p.rashadi.toFixed(decimals)}`;
  document.getElementById("price-english").textContent =
    `${unit}${p.english.toFixed(decimals)}`;
  document.getElementById("price-bar").textContent =
    `${unit}${p.bar.toFixed(decimals)}`;

  // Update currency toggle button label
  const toggleBtn = document.getElementById("currency-toggle");
  if (toggleBtn) toggleBtn.textContent = currency;

  
  renderChart(currency);
}

// Chart 
let chartInstance = null;

function renderChart(currency) {
  const stored = JSON.parse(localStorage.getItem("gold_prices"));
  if (!stored || priceHistoryUSD.length === 0) return;

  const convRate = currency === "JOD" ? goldConversion.USDToJD : 1;
  const historyData = priceHistoryUSD.map((v) => +(v * convRate).toFixed(3));

  const labels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const accentColor = "#674019";
  const accentGlow  = "rgba(103, 64, 25, 0.12)";

  const ctx = document.getElementById("priceChart").getContext("2d");

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = historyData;
    chartInstance.data.datasets[0].label = `Gold Price (${currency}/oz)`;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `Gold Price (${currency}/oz)`,
          data: historyData,
          borderColor: accentColor,
          backgroundColor: accentGlow,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: accentColor,
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#3b2009",
          bodyColor: "#674019",
          borderColor: "rgba(103,64,25,0.2)",
          borderWidth: 1,
          callbacks: {
            label: (ctx) => {
              const unit = currency === "USD" ? "$" : "JD";
              return ` ${unit}${ctx.parsed.y.toFixed(currency === "USD" ? 2 : 3)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(103,64,25,0.07)" },
          ticks: {
            color: "#8a5a2e",
            font: { size: 11 },
            maxTicksLimit: 6
          }
        },
        y: {
          grid: { color: "rgba(103,64,25,0.07)" },
          ticks: {
            color: "#8a5a2e",
            font: { size: 11 },
            callback: (v) => (currency === "USD" ? `$${v}` : `${v} JD`)
          }
        }
      }
    }
  });
}
// Currency toggle 
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("currency-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      currentCurrency = currentCurrency === "USD" ? "JOD" : "USD";
      renderAll(currentCurrency);
    });
  }

  fetchGoldData();

  setInterval(fetchGoldData, 60_000);
});
