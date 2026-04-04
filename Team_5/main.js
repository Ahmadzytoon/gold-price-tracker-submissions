let labels = [];
let prices = [];
let currentCurrency = 'USD';
let previousValues = null;

const ctx = document.getElementById('goldChart').getContext('2d');

const goldChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Gold Price',
            data: prices,
            borderColor: '#f3c623',
            borderWidth: 2,
            backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx: c, chartArea } = chart;
                if (!chartArea) return 'transparent';
                const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(243,198,35,0.18)');
                gradient.addColorStop(1, 'rgba(243,198,35,0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#f3c623',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#10375c',
                titleColor: 'rgba(255,255,255,0.6)',
                bodyColor: '#f3c623',
                bodyFont: { weight: '600', size: 14 },
                titleFont: { size: 12 },
                padding: 10,
                borderColor: 'rgba(243,198,35,0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (item) => `$${item.parsed.y.toLocaleString()}`,
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11, family: 'Inter, sans-serif' },
                    maxTicksLimit: 6,
                }
            },
            y: {
                beginAtZero: false,
                position: 'right',
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                    drawBorder: false,
                },
                border: { display: false, dash: [4, 4] },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11, family: 'Inter, sans-serif' },
                    maxTicksLimit: 5,
                    callback: (val) => `$${val.toLocaleString()}`,
                }
            }
        }
    }
});

// Helper: Build change indicator HTML (arrow + percentage)
function buildChangeIndicator(current, previous) {
    if (previous == null) return '';
    const diff = current - previous;
    const pct = ((diff / previous) * 100).toFixed(2);
    if (diff > 0) {
        return `<span class="price-change up">▲ ${pct}%</span>`;
    } else if (diff < 0) {
        return `<span class="price-change down">▼ ${Math.abs(pct)}%</span>`;
    } else {
        return `<span class="price-change neutral">— 0.00%</span>`;
    }
}

// Helper: Set text + change indicator on an element pair
function updateWithIndicator(valueId, indicatorId, newVal, prevVal) {
    const el = document.getElementById(valueId);
    const ind = document.getElementById(indicatorId);
    if (el) {
        // Flash animation on update
        el.classList.remove('price-flash');
        void el.offsetWidth; // reflow to restart animation
        el.textContent = newVal;
        if (prevVal !== null) el.classList.add('price-flash');
    }
    if (ind) ind.innerHTML = buildChangeIndicator(parseFloat(newVal), prevVal);
}

// Calculate gold values from USD ounce price
function Calculate_Gold_Values(priceUSD) {
    const gram24 = priceUSD / 31.1035;
    const gram22 = gram24 * (22 / 24);
    const gram21 = gram24 * (21 / 24);
    const gram18 = gram24 * (18 / 24);

    return {
        ounce: priceUSD,
        gram24: gram24,
        gram21: gram21,
        gram18: gram18,
        rashadi: gram22 * 7.20,
        english: gram22 * 8.00
    };
}

// Fetch USD → JOD exchange rate
function getUSDToJOD(callback) {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
    .then(response => response.json())
    .then(data => { callback(data.rates.JOD); })
    .catch(error => { console.error("Currency API failed", error); callback(null); });
}

// Main fetch + update function
function getGoldPrice() {
    fetch("https://api.gold-api.com/price/XAU")
    .then(response => response.json())
    .then(data => {
        const priceUSD = data.price;
        const time = new Date().toLocaleTimeString();
        const baseValues = Calculate_Gold_Values(priceUSD);

        getUSDToJOD(function(usdToJod) {
            const rate = (currentCurrency === 'JOD' && usdToJod) ? usdToJod : 1;

            const display = {
                ounce:   (baseValues.ounce   * rate).toFixed(2),
                g24:     (baseValues.gram24  * rate).toFixed(2),
                g21:     (baseValues.gram21  * rate).toFixed(2),
                g18:     (baseValues.gram18  * rate).toFixed(2),
                rashadi: (baseValues.rashadi * rate).toFixed(2),
                english: (baseValues.english * rate).toFixed(2)
            };

            // Previous values for comparison
            const prev = previousValues;

            // --- Ticker bar ---
            if (document.getElementById('tick-usd')) document.getElementById('tick-usd').textContent = display.ounce;
            if (document.getElementById('tick-24k')) document.getElementById('tick-24k').textContent = display.g24;
            if (document.getElementById('tick-21k')) document.getElementById('tick-21k').textContent = display.g21;
            if (document.getElementById('tick-18k')) document.getElementById('tick-18k').textContent = display.g18;
            if (document.getElementById('tick-rashadi')) document.getElementById('tick-rashadi').textContent = display.rashadi;
            if (document.getElementById('tick-english')) document.getElementById('tick-english').textContent = display.english;

            // Ticker change arrow (ounce only)
            if (document.getElementById('tick-usd-change')) {
                document.getElementById('tick-usd-change').innerHTML = buildChangeIndicator(
                    parseFloat(display.ounce),
                    prev ? parseFloat(prev.ounce) : null
                );
            }

            // --- Main price cards with indicators ---
            updateWithIndicator('ounce-price',   'ind-ounce',   display.ounce,   prev ? parseFloat(prev.ounce)   : null);
            updateWithIndicator('gram-24k',      'ind-24k',     display.g24,     prev ? parseFloat(prev.g24)     : null);
            updateWithIndicator('gram-21k',      'ind-21k',     display.g21,     prev ? parseFloat(prev.g21)     : null);
            updateWithIndicator('gram-18k',      'ind-18k',     display.g18,     prev ? parseFloat(prev.g18)     : null);
            updateWithIndicator('rashadi-price', 'ind-rashadi', display.rashadi, prev ? parseFloat(prev.rashadi) : null);
            updateWithIndicator('english-price', 'ind-english', display.english, prev ? parseFloat(prev.english) : null);

            // --- Chart (always USD) ---
            labels.push(time);
            prices.push(priceUSD);
            if (labels.length > 100) { labels.shift(); prices.shift(); }
            goldChart.update();

            // Save current as previous
            previousValues = { ...display };
        });
    })
    .catch(error => console.error("Gold API failed", error));
}

// Currency toggle
function toggleCurrency(currency) {
    currentCurrency = currency;
    previousValues = null; // Reset comparison when switching currency

    const usdBtn = document.querySelector('button[onclick="toggleCurrency(\'USD\')"]');
    const jodBtn = document.querySelector('button[onclick="toggleCurrency(\'JOD\')"]');

    if (currency === 'USD') {
        if (usdBtn) usdBtn.classList.add('active');
        if (jodBtn) jodBtn.classList.remove('active');
    } else {
        if (jodBtn) jodBtn.classList.add('active');
        if (usdBtn) usdBtn.classList.remove('active');
    }

    getGoldPrice();
}

// Start
getGoldPrice();
setInterval(getGoldPrice, 5000);
//check if login in manage my assets
const button = document.getElementById("myButton");

button.addEventListener("click", function (e) {
  if (!isLogin()) {
    e.preventDefault();
     Swal.fire({
      title: "Access Denied",
      text: " You shoud Login first  🔒",
      icon: "error",
      timer: 2000,
      showConfirmButton: false,
      willClose: () => {
        window.location.href = "/pages/login.html";
      },
    });
  } 
});

const myAssets = document.getElementById("assets");
const loginSignupGroup = document.getElementById("btn-log-sing");
const navContainer = document.querySelector(".navbar-collapse"); 

if (!isLogin()) {
    myAssets.style.display = "none";
} else {
    loginSignupGroup.style.display = "none";

    const logoutBtnHTML = `
        <div id="btn-logout" class="d-flex align-items-center gap-2">
             <a href="#" class="btn btn-register d-flex align-items-center gap-2" onclick="logOut()">
                <i class="fa-solid fa-right-from-bracket fs-4" ></i> Log Out
             </a>
        </div>`;

    navContainer.insertAdjacentHTML("beforeend", logoutBtnHTML);
}


