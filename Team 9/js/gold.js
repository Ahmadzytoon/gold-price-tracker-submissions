let currentOuncePrice = 0;
let currentCurrency = "USD";

async function fetchGoldPrice() {
  try {
    let res = await fetch(GOLD_API_URL, {
      headers: { "x-access-token": GOLD_API_KEY }
    });
    let data = await res.json();
    currentOuncePrice = data.price;
    addPriceSnapshot(currentOuncePrice);
    return currentOuncePrice;
  } catch (error) {
    console.log("Error fetching gold price:", error);
    return null;
  }
}

function getGramPrice() {
  return currentOuncePrice / TROY_OUNCE;
}

function getKaratPrice(karat) {
  return getGramPrice() * KARAT_PURITY[karat];
}

function getCoinPrice(type) {
  return getGramPrice() * GOLD_WEIGHTS[type];
}

function getBarPrice() {
  return getGramPrice() * GOLD_WEIGHTS.bar;
}

function convertToJOD(usdPrice) {
  return usdPrice * JOD_RATE;
}

function formatPrice(price) {
  if (currentCurrency === "JOD") {
    return (price * JOD_RATE).toFixed(2) + " JOD";
  } else {
    return "$" + price.toFixed(2);
  }
}

async function fetchNews() {
  try {
    let res = await fetch(NEWS_API_URL);
    let data = await res.json();
    return data.data || [];
  } catch (error) {
    console.log("Error fetching news:", error);
    return [];
  }
}
