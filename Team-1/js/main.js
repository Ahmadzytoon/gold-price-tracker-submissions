let goldPrice = null;
let chart;
let goldHistory = [];

const jod = document.getElementById('jod');
const usd = document.getElementById('usd');
const goldBar = document.getElementById('goldBar');
const modal = document.getElementById('goldModal');
const closeBtn = document.getElementById('closeModal');
const calcBtn = document.getElementById('calcGold');
const result = document.getElementById('goldResult');

function updateHeader() {
  const user = JSON.parse(sessionStorage.getItem('currentUser'));
  const loginLink = document.querySelector('[data-auth="login-link"]');
  const registerItem = document.querySelector('[data-auth="register-item"]');
  const hello = document.querySelector('[data-auth="greeting"]');

  if (!loginLink) return;

  if (user) {
    loginLink.textContent = 'Logout';
    loginLink.href = '#';
    loginLink.onclick = function (e) {
      e.preventDefault();
      sessionStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    };

    if (registerItem) registerItem.style.display = 'none';
    if (hello) {
      hello.style.display = 'block';
      hello.textContent = 'Hi, ' + (user.username || user.email || 'User');
    }
  } else {
    loginLink.textContent = 'Login';
    loginLink.href = 'Login.html';
    loginLink.onclick = null;
    if (registerItem) registerItem.style.display = '';
    if (hello) hello.style.display = 'none';
  }
}

if (jod && usd) {
  jod.addEventListener('click', function (e) {
    e.preventDefault();
    jod.classList.add('btn-gold');
    usd.classList.remove('btn-gold');
    updateUI('JOD');
    renderGoldChart(goldHistory, 'JOD');
  });

  usd.addEventListener('click', function (e) {
    e.preventDefault();
    usd.classList.add('btn-gold');
    jod.classList.remove('btn-gold');
    updateUI('USD');
    renderGoldChart(goldHistory, 'USD');
  });
}

function buildLast30Days(data, currency) {
  const map = {};

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const key = new Date(item.day).toISOString().split('T')[0];
    map[key] = Number(item.max_price);
  }

  const labels = [];
  const prices = [];
  let lastPrice = null;

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);

    const key = d.toISOString().split('T')[0];
    let price = map[key];

    if (!Number.isFinite(price)) {
      price = lastPrice;
    } else {
      lastPrice = price;
    }

    if (Number.isFinite(price) && currency === 'JOD') {
      price = USDToJOD(price);
    }

    labels.push(
      d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      })
    );
    prices.push(price);
  }

  return { labels: labels, prices: prices };
}

async function getGoldHistory() {
  const stored = localStorage.getItem('goldHistory');

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    } catch (error) {
      console.log(error);
    }
  }

  const endTimestamp = Math.floor(Date.now() / 1000);
  const startTimestamp = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);

  const url = `https://api.gold-api.com/history?symbol=XAU&groupBy=day&startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}`;

  const res = await fetch(url, {
    headers: {
      'x-api-key': '3a999d7b4773470018fcfb0777ddf0052e9c81dbb899461059c3a2245c99aee9',
    },
  });

  const data = await res.json();
  const safeHistory = Array.isArray(data) ? data : [];

  localStorage.setItem('goldHistory', JSON.stringify(safeHistory));
  return safeHistory;
}

async function initChart() {
  goldHistory = await getGoldHistory();
  renderGoldChart(goldHistory, 'USD');
}

async function fetchGoldPrice() {
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU');
    const data = await res.json();

    goldPrice = Number(data.price);
    localStorage.setItem('goldPrice', goldPrice);

    updateUI('USD');
  } catch (error) {
    console.error(error);
  }
}

async function initGoldPrice() {
  const stored = localStorage.getItem('goldPrice');

  if (stored) {
    goldPrice = Number(stored);
    updateUI('USD');
  }

  await fetchGoldPrice();
}

function getGoldPrice() {
  return goldPrice;
}

function USDToJOD(num) {
  return num * 0.709;
}

function getGramPrice(karat) {
  const ounce = getGoldPrice();
  if (!ounce) return null;

  const gram24 = ounce / 31.1035;
  return gram24 * (karat / 24);
}

function renderGoldChart(data, currency) {
  const chartCanvas = document.getElementById('goldChart');
  if (!chartCanvas || !Array.isArray(data) || !data.length) return;

  const built = buildLast30Days(data, currency || 'USD');
  const labels = [];

  for (let i = 0; i < built.labels.length; i++) {
    if (i % 5 === 0 || i === built.labels.length - 1) {
      labels.push(built.labels[i]);
    } else {
      labels.push('');
    }
  }

  const ctx = chartCanvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);

  gradient.addColorStop(0, 'rgba(238, 210, 154, 0.4)');
  gradient.addColorStop(1, 'rgba(238, 210, 154, 0)');

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `Gold Price (${currency})`,
          data: built.prices,
          borderWidth: 2,
          tension: 0,
          borderColor: 'rgb(238, 210, 154)',
          backgroundColor: gradient,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            color: 'rgb(238, 210, 154)',
          },
        },
        y: {
          ticks: {
            color: 'rgb(238, 210, 154)',
          },
        },
      },
    },
  });
}

function convertCurrency(amount, currency) {
  if (currency === 'JOD') return USDToJOD(amount);
  return amount;
}

function formatMoney(amount, currency) {
  return currency === 'JOD' ? `${amount.toFixed(2)} JOD` : `$${amount.toFixed(2)}`;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function updateUI(currency) {
  currency = currency || 'USD';
  const ounce = getGoldPrice();
  if (!ounce) return;

  const ounceConverted = convertCurrency(ounce, currency);
  setText('price-usd', formatMoney(ounceConverted, currency) + ' / oz');

  const price24 = convertCurrency(getGramPrice(24), currency);
  const price21 = convertCurrency(getGramPrice(21), currency);
  const price18 = convertCurrency(getGramPrice(18), currency);

  const rashidiCoin = convertCurrency(getGramPrice(24) * 7, currency);
  const englishCoin = convertCurrency(getGramPrice(24) * 8, currency);

  setText('price-24k', formatMoney(price24, currency));
  setText('price-21k', formatMoney(price21, currency));
  setText('price-18k', formatMoney(price18, currency));
  setText('rashidi-price', formatMoney(rashidiCoin, currency));
  setText('english-price', formatMoney(englishCoin, currency));
}

setInterval(fetchGoldPrice, 60000);

if (goldBar && modal) {
  goldBar.addEventListener('click', function () {
    modal.classList.add('active');
  });
}

if (closeBtn && modal) {
  closeBtn.addEventListener('click', function () {
    modal.classList.remove('active');
    const weightInput = document.getElementById('goldWeight');
    if (weightInput) weightInput.value = '';
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

if (calcBtn && result) {
  calcBtn.addEventListener('click', function () {
    const weight = parseFloat(document.getElementById('goldWeight').value);

    if (!goldPrice) {
      result.innerText = '⚠️ Price not loaded';
      return;
    }

    if (isNaN(weight) || weight <= 0) {
      result.innerText = '⚠️ Enter valid weight';
      return;
    }

    const currency = usd && usd.classList.contains('btn-gold') ? 'USD' : 'JOD';
    const totalUSD = weight * getGramPrice(24);
    const final = currency === 'JOD' ? USDToJOD(totalUSD) : totalUSD;

    result.innerText = `💰 Total: ${formatMoney(final, currency)}`;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  updateHeader();
  initGoldPrice();
  initChart();
});
