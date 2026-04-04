const API_KEY =
  "c300a96f6a41c0f343e4a25b81e484a4cd3c064f46247aa16bf2636718aedef4";

let chart;
let dataPoints = [];

//  Currency state
let currentCurrency = "USD";
const USD_TO_JOD = 0.709;

//  Fetch gold price
async function fetchGoldPrice() {
  try {
    const res = await fetch("https://api.gold-api.com/price/XAU", {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) throw new Error("API error " + res.status);

    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

// Load from localStorage
function loadData() {
  const saved = localStorage.getItem("goldData");
  if (saved) {
    dataPoints = JSON.parse(saved);
  }
}

//  Save to localStorage
function saveData() {
  localStorage.setItem("goldData", JSON.stringify(dataPoints));
}

//  Convert prices
function getConvertedPrices() {
  return dataPoints.map((d) => {
    return currentCurrency === "USD"
      ? d.price
      : (d.price * USD_TO_JOD).toFixed(2);
  });
}

// Create chart
function createChart() {
  const ctx = document.getElementById("goldChart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dataPoints.map((d) => d.date), // ✅ DATE ONLY
      datasets: [
        {
          label: "Gold Price (" + currentCurrency + ")",
          data: getConvertedPrices(),
          borderColor: "#d4af37",
          backgroundColor: "rgba(212,175,55,0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

//  Update chart (FIXED)
function updateChart(price) {
  const now = new Date();

  const date = now.toLocaleDateString("en-GB"); // ✅ NO TIME

  // check if today already exists
  const index = dataPoints.findIndex((d) => d.date === date);

  if (index !== -1) {
    // update today
    dataPoints[index].price = price;
  } else {
    // add new day
    dataPoints.push({
      date,
      price,
    });
  }

  // keep last 30 days
  if (dataPoints.length > 30) {
    dataPoints.shift();
  }

  saveData();

  chart.data.labels = dataPoints.map((d) => d.date);
  chart.data.datasets[0].data = getConvertedPrices();
  chart.data.datasets[0].label = "Gold Price (" + currentCurrency + ")";

  chart.update();
}

//  Toggle currency
function setupToggleButton() {
  const btn = document.getElementById("currencyToggle");

  if (!btn) return;

  btn.addEventListener("click", () => {
    if (currentCurrency === "USD") {
      currentCurrency = "JOD";
      btn.innerText = "Switch to USD";
    } else {
      currentCurrency = "USD";
      btn.innerText = "Switch to JOD";
    }

    chart.data.datasets[0].data = getConvertedPrices();
    chart.data.datasets[0].label = "Gold Price (" + currentCurrency + ")";
    chart.update();
  });
}

// Main init
async function init() {
  loadData();

  createChart();
  setupToggleButton();

  const data = await fetchGoldPrice();
  if (!data) return;

  updateChart(data.price);

  // every 2.4 hours
  setInterval(async () => {
    const newData = await fetchGoldPrice();

    if (newData) {
      updateChart(newData.price);
    }
  }, 8640000);
}

init();
