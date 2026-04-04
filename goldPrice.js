const priceElement = document.getElementById("goldPrice");
const statusElement = document.getElementById("status");
const priceElementGram24 = document.getElementById("goldPriceGram-24");
const priceElementGram21 = document.getElementById("goldPriceGram-21");
const priceElementGram18 = document.getElementById("goldPriceGram-18");
const priceElementRashadi = document.getElementById("goldPriceGram-Rashadi");
const priceElementEnglish = document.getElementById("goldPriceGram-english");
const priceElementGoldBar = document.getElementById("goldPriceGram-goldbar");

// Currency toggle
let isJOD = false;
const JOD_RATE = 0.709; // 1 USD ≈ 0.709 JOD

function formatPrice(value) {
  return isJOD
    ? (value * JOD_RATE).toFixed(2) + " JOD"
    : "$" + value.toFixed(2);
}

// Button function
function toggleCurrency() {
  isJOD = !isJOD;

  const btn = document.getElementById("currencyBtn");
  if (btn) {
    btn.textContent = isJOD ? "Switch to USD" : "Switch to JOD";
  }

  getGoldPrice();
}

async function getGoldPrice() {
  try {
    statusElement.textContent = "Updating...";

    const response = await fetch("https://api.gold-api.com/price/XAU");

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const data = await response.json();

    if (!data.price) {
      throw new Error("Invalid API response");
    }

    localStorage.setItem("liveGoldPrice", data.price);

    priceElement.textContent = formatPrice(data.price);
    statusElement.textContent = "Updated Now";

    // Calculate price per gram24k
    const pricePerGram24 = data.price / 31.1035;
    priceElementGram24.textContent = formatPrice(pricePerGram24);

    // Calculate price per gram for 21k
    const pricePerGram21 = pricePerGram24 * (21 / 24);
    priceElementGram21.textContent = formatPrice(pricePerGram21);

    // Calculate price per gram for 18k
    const pricePerGram18 = pricePerGram24 * (18 / 24);
    priceElementGram18.textContent = formatPrice(pricePerGram18);

    // Rashadi Coin (7.2g of 21k)
    const priceRashadi = pricePerGram21 * 7.2;
    priceElementRashadi.textContent = formatPrice(priceRashadi);

    // English Coin (8g of 21k)
    const priceEnglish = pricePerGram21 * 8;
    priceElementEnglish.textContent = formatPrice(priceEnglish);

    // Gold Bar (1000g of 24k)
    const priceGoldBar = pricePerGram24 * 1000;
    priceElementGoldBar.textContent = formatPrice(priceGoldBar);
  } catch (error) {
    console.error("ERROR:", error);
    statusElement.textContent = "Error fetching data ❌";
  }
}

getGoldPrice();

// Update every 5 seconds
setInterval(getGoldPrice, 5000);
