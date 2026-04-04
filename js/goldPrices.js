// ---- CONFIG ------------------------------------------------------------------------------------------------------------
var GOLD_API_KEY = '9404f38900e589a465c2752aba93bd61991e8b4d1c484993fabd35fb438f4829';
var GOLD_API_URL = 'https://api.gold-api.com/price/XAU';

// Currency
var USD_TO_JOD = 0.709;

// Ticker direction tracking
var lastTickerOzPrice = 0;

// Gold weights (grams)
var RASHADI_WEIGHT_G = 6.494;  // gold content in grams (21.6K)
var ENGLISH_WEIGHT_G = 7.322;  // gold content in grams (22K)
var TROY_OZ_TO_GRAM = 31.1035;
var TOLA_TO_GRAM = 11.6638;

// Bar sizes in grams
var BAR_SIZES = [
  { name: '1 gram', weight: 1 },
  { name: '5 grams', weight: 5 },
  { name: '10 grams', weight: 10 },
  { name: '50 grams', weight: 50 },
  { name: '100 grams', weight: 100 },
  { name: '250 grams', weight: 250 },
  { name: '500 grams', weight: 500 },
  { name: '1 kg', weight: 1000 },
];

// ---- STATE ----------------------------------------------------------------------------------------------------------------
var currentCurrency = 'USD';
var currentOzPriceUSD = 0;
var chartData = { labels: [], usd: [], jod: [] };
var priceChart = null;

// ---- FETCH GOLD PRICE ------------------------------------------------------------------------------------------
function fetchGoldPrice() {
  fetch(GOLD_API_URL, { headers: { 'x-api-key': GOLD_API_KEY } })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data && data.price) {
        var prevPrice = currentOzPriceUSD;
        currentOzPriceUSD = parseFloat(data.price);
        updateAllPrices(prevPrice);
        saveChartPoint(currentOzPriceUSD);
      }
    })
    .catch(function (err) {
      console.warn('Gold API error, using demo price:', err);
      // Demo fallback price
      var prevPrice = currentOzPriceUSD;
      currentOzPriceUSD = 3020 + (Math.random() * 20 - 10);
      updateAllPrices(prevPrice);
    });
}

// ---- CALCULATIONS ----------------------------------------------------------------------------------------------------
function getGramPrice24K(ozPriceUSD) {
  return ozPriceUSD / TROY_OZ_TO_GRAM;
}

function getKaratPrice(ozPriceUSD, karat) {
  var purity = karat / 24;
  return getGramPrice24K(ozPriceUSD) * purity;
}

function convertPrice(usdPrice) {
  if (currentCurrency === 'JOD') return usdPrice * USD_TO_JOD;
  return usdPrice;
}

function formatPrice(usdPrice, decimals) {
  decimals = decimals || 2;
  var p = convertPrice(usdPrice);
  var sym = currentCurrency === 'JOD' ? 'JD ' : '$';
  return sym + p.toFixed(decimals);
}

function formatOz(usdPrice) {
  return formatPrice(usdPrice, 2);
}

// ---- UPDATE ALL PRICES ------------------------------------------------------------------------------------------
function updateAllPrices(prevPrice) {
  var oz = currentOzPriceUSD;
  var g24 = getGramPrice24K(oz);
  var g21 = getKaratPrice(oz, 21);
  var g18 = getKaratPrice(oz, 18);
  var rashadi = g24 * RASHADI_WEIGHT_G;
  var english = g24 * ENGLISH_WEIGHT_G;
  var bar1kg = g24 * 1000;

  var now = new Date();
  var timeStr = 'Updated ' + now.toLocaleTimeString();

  // Direction indicator
  var dir = oz > prevPrice ? 'up' : oz < prevPrice ? 'down' : 'same';

  // ---- HOME PAGE ----
  setEl('priceUSD', '$' + oz.toFixed(2), dir);
  setEl('priceJOD', 'JD ' + (oz * USD_TO_JOD).toFixed(2), dir);
  setEl('priceTime', timeStr);

  setEl('rate24', formatPrice(g24));
  setEl('rate21', formatPrice(g21));
  setEl('rate18', formatPrice(getKaratPrice(oz, 18)));
  setEl('rateRashadi', formatPrice(rashadi));
  setEl('rateEnglish', formatPrice(english));
  setEl('rateBar', formatPrice(bar1kg, 0));

  // ---- PRICES PAGE ----
  // priceUSD, priceJOD, priceTime IDs are shared with home page card above

  // Karat big cards (may not exist on prices page anymore)
  setEl('k24gram', formatPrice(g24));
  setEl('k21gram', formatPrice(g21));
  setEl('k18gram', formatPrice(getKaratPrice(oz, 18)));

  setEl('k24oz', formatOz(oz));
  setEl('k21oz', formatOz(oz * (21 / 24)));
  setEl('k18oz', formatOz(oz * (18 / 24)));

  setEl('k24tola', formatPrice(g24 * TOLA_TO_GRAM));
  setEl('k21tola', formatPrice(g21 * TOLA_TO_GRAM));
  setEl('k18tola', formatPrice(getKaratPrice(oz, 18) * TOLA_TO_GRAM));

  // Coin prices
  setEl('rashadiPrice', formatPrice(rashadi));
  setEl('englishPrice', formatPrice(english));

  // Build karat table (hidden, for compatibility)
  buildKaratTable(oz);
  // Build karat carousel (prices page)
  buildKaratCarousel(oz);
  // Build bar table
  buildBarTable(oz);

  // Ticker
  buildTicker(oz, g24, g21, g18, rashadi, english);

  // Re-run calc if inputs filled
  calculate();
}

// ---- SET ELEMENT ------------------------------------------------------------------------------------------------------
function setEl(id, val, dir) {
  var el = document.getElementById(id);
  if (!el) return;
  var prev = el.textContent;
  el.textContent = val;
  if (dir === 'up' && prev !== val) { el.classList.remove('price-down'); el.classList.add('price-up'); el.parentElement && el.parentElement.classList.add('flash-up'); }
  if (dir === 'down' && prev !== val) { el.classList.remove('price-up'); el.classList.add('price-down'); el.parentElement && el.parentElement.classList.add('flash-down'); }
}

// ---- BUILD KARAT TABLE ------------------------------------------------------------------------------------------
function buildKaratTable(oz) {
  var tbody = document.getElementById('karatTableBody');
  if (!tbody) return;
  var karats = [24, 22, 21, 18, 14, 12, 10, 9];
  var rows = karats.map(function (k) {
    var gPrice = getGramPrice24K(oz) * (k / 24);
    return '<tr>' +
      '<td class="bold">' + k + 'K</td>' +
      '<td>' + ((k / 24) * 100).toFixed(1) + '%</td>' +
      '<td class="bold">' + formatPrice(gPrice) + '</td>' +
      '<td>' + formatOz(oz * (k / 24)) + '</td>' +
      '<td>' + formatPrice(gPrice * 10) + '</td>' +
      '<td>' + formatPrice(gPrice * 100) + '</td>' +
      '</tr>';
  });
  tbody.innerHTML = rows.join('');
}

// ---- BUILD KARAT CAROUSEL (prices.html) -------------------------------------------------------------------------
var karatCarouselInstance = null;

function buildKaratCarousel(oz) {
  var inner = document.getElementById('karatCarouselInner');
  var progressEl = document.getElementById('karatCarouselProgress');
  if (!inner) return;

  var karats = [
    { k: 24, label: '24K', purity: '99.9%', color: '#C9952A' },
    { k: 22, label: '22K', purity: '91.7%', color: '#C9952A' },
    { k: 21, label: '21K', purity: '87.5%', color: '#B18E62' },
    { k: 18, label: '18K', purity: '75.0%', color: '#9e7d3a' },
    { k: 14, label: '14K', purity: '58.3%', color: '#7a6230' },
    { k: 12, label: '12K', purity: '50.0%', color: '#7a6230' },
    { k: 10, label: '10K', purity: '41.7%', color: '#6b5526' },
    { k: 9,  label: '9K',  purity: '37.5%', color: '#6b5526' }
  ];

  var slidesHtml = karats.map(function (item, idx) {
    var g = getGramPrice24K(oz) * (item.k / 24);
    var isFirst = idx === 0 ? ' active' : '';
    return '<div class="carousel-item' + isFirst + '">' +
      '<div class="karat-slide-card">' +
        '<div>' +
          '<div class="ks-karat" style="color:' + item.color + '">' + item.label + '</div>' +
          '<div class="ks-purity">' + item.purity + ' pure gold</div>' +
        '</div>' +
        '<div class="ks-divider"></div>' +
        '<div class="ks-prices">' +
          '<div class="ks-price-block">' +
            '<div class="ks-label">Per Gram</div>' +
            '<div class="ks-value">' + formatPrice(g) + '</div>' +
          '</div>' +
          '<div class="ks-price-block">' +
            '<div class="ks-label">Per Oz</div>' +
            '<div class="ks-value">' + formatOz(oz * (item.k / 24)) + '</div>' +
          '</div>' +
          '<div class="ks-price-block">' +
            '<div class="ks-label">Per 10g</div>' +
            '<div class="ks-value">' + formatPrice(g * 10) + '</div>' +
          '</div>' +
          '<div class="ks-price-block">' +
            '<div class="ks-label">Per 100g</div>' +
            '<div class="ks-value">' + formatPrice(g * 100) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  inner.innerHTML = slidesHtml;

  // Build tab-style progress nav
  if (progressEl) {
    var progressHtml = karats.map(function (item, idx) {
      var isActive = idx === 0 ? ' active' : '';
      return '<div class="kcp-item' + isActive + '" data-idx="' + idx + '" onclick="goToKaratSlide(' + idx + ')">' +
        '<div class="kcp-bar"></div>' +
        '<div class="kcp-label">' + item.label + '</div>' +
      '</div>';
    }).join('');
    progressEl.innerHTML = progressHtml;
  }

  // Init Bootstrap carousel and sync progress nav on slide
  var carouselEl = document.getElementById('karatCarousel');
  if (carouselEl && typeof bootstrap !== 'undefined') {
    if (!karatCarouselInstance) {
      karatCarouselInstance = new bootstrap.Carousel(carouselEl, { interval: false, wrap: true });
      carouselEl.addEventListener('slid.bs.carousel', function (e) {
        syncKaratProgress(e.to);
      });
    }
  }
}

function goToKaratSlide(idx) {
  if (karatCarouselInstance) {
    karatCarouselInstance.to(idx);
  }
  syncKaratProgress(idx);
}

function syncKaratProgress(idx) {
  var items = document.querySelectorAll('.kcp-item');
  items.forEach(function (el, i) {
    el.classList.toggle('active', i === idx);
  });
}

// ---- BUILD BAR TABLE ----------------------------------------------------------------------------------------------
function buildBarTable(oz) {
  var tbody = document.getElementById('barTableBody');
  if (!tbody) return;
  var g24 = getGramPrice24K(oz);
  var rows = BAR_SIZES.map(function (bar) {
    return '<tr>' +
      '<td class="bold">' + bar.name + '</td>' +
      '<td>' + bar.weight + ' g</td>' +
      '<td class="bold">' + formatPrice(g24 * bar.weight, bar.weight >= 100 ? 0 : 2) + '</td>' +
      '</tr>';
  });
  tbody.innerHTML = rows.join('');
}

// ---- TICKER (the track moving line)----------------------------------------------------------------------------------------------------------------
function buildTicker(oz, g24, g21, g18, rashadi, english) {
  var dir = oz > lastTickerOzPrice ? 'up' : oz < lastTickerOzPrice ? 'down' : 'same';
  if (oz !== lastTickerOzPrice) lastTickerOzPrice = oz;

  var arrow = dir === 'up' ? '<span style="color:#5dde8a">▲</span>' : dir === 'down' ? '<span style="color:#ff7c7c">▼</span>' : '';

  var items = [
    'XAU/USD: ' + formatOz(oz) + ' ' + arrow,
    '24K/g: ' + formatPrice(g24) + ' ' + arrow,
    '21K/g: ' + formatPrice(g21),
    '18K/g: ' + formatPrice(g18),
    'Rashadi: ' + formatPrice(rashadi),
    'English: ' + formatPrice(english),
    '1 kg Bar: ' + formatPrice(g24 * 1000, 0),
  ];
  // Duplicate for seamless loop
  var all = items.concat(items);
  var html = all.map(function (t) {
    return '<span class="ticker-item">🪙 ' + t + '</span>';
  }).join('');
  var track = document.getElementById('tickerTrack');
  if (track) track.innerHTML = html;
}

// ---- CURRENCY TOGGLE ----------------------------------------------------------------------------------------------
function setCurrency(cur) {
  currentCurrency = cur;

  // Sync all .toggle-btn and .ctoggle elements
  var btns = document.querySelectorAll('.toggle-btn, .ctoggle');
  btns.forEach(function (b) {
    b.classList.remove('active');
    if (b.textContent.trim() === cur) {
      b.classList.add('active');
    }
  });

  if (currentOzPriceUSD > 0) updateAllPrices(currentOzPriceUSD);
  updateChartCurrency();
}

// ---- CHART HISTORY API ------------------------------------------------------------------------------------------------------------------
var HISTORY_API_URL = 'https://api.gold-api.com/history';
var HISTORY_CACHE_KEY = 'goldHistoryCache';
var HISTORY_CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

// saveChartPoint is kept as a no-op so existing callers in fetchGoldPrice don't break
function saveChartPoint(priceUSD) {
  // History is now managed via fetchChartHistory — no manual point saving needed
}

// Fetch history from API, cache result in localStorage for 1 hour
function fetchChartHistory(startTimestamp, endTimestamp, groupBy, callback) {
  groupBy = groupBy || 'day';

  var cacheKey = HISTORY_CACHE_KEY + '_' + startTimestamp + '_' + endTimestamp + '_' + groupBy;
  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch (e) {}

  // Return cached data if still fresh (under 1 hour old)
  if (cached && cached.fetchedAt && (Date.now() - cached.fetchedAt) < HISTORY_CACHE_TTL) {
    callback(cached.data);
    return;
  }

  var url = HISTORY_API_URL +
    '?symbol=XAU' +
    '&startTimestamp=' + startTimestamp +
    '&endTimestamp=' + endTimestamp +
    '&groupBy=' + groupBy +
    '&aggregation=max' +
    '&orderBy=asc';

  fetch(url, {
    headers: { 'x-api-key': GOLD_API_KEY }
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      // API returns an array directly
      var arr = Array.isArray(data) ? data : [];
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), data: arr }));
      } catch (e) {}
      callback(arr);
    })
    .catch(function (err) {
      console.warn('History API error:', err);
      // If we have stale cache, use it rather than showing nothing
      if (cached && cached.data) {
        callback(cached.data);
      } else {
        callback([]);
      }
    });
}

// Convert API response array into chartData labels/usd/jod
function parseHistoryToChartData(arr, groupBy) {
  var result = { labels: [], usd: [], jod: [] };
  groupBy = groupBy || 'day';

  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];

    // Build label depending on groupBy
    var label = '';
    if (groupBy === 'day' && item.day) {
      // item.day is usually "YYYY-MM-DD" or a date string
      var d = new Date(item.day);
      label = (d.getMonth() + 1) + '/' + d.getDate();
    } else if (groupBy === 'week' && item.week) {
      label = 'W' + item.week;
    } else if (groupBy === 'month' && item.month) {
      label = item.month; // e.g. "2024-03"
    } else if (groupBy === 'year' && item.year) {
      label = String(item.year);
    } else {
      // Fallback: use index
      label = String(i + 1);
    }

    var price = parseFloat(item.max_price || item.avg_price || item.min_price || 0);
    if (!price) continue;

    result.labels.push(label);
    result.usd.push(price.toFixed(2));
    result.jod.push((price * USD_TO_JOD).toFixed(2));
  }
  return result;
}

// Called once on page load — fetches last 30 days by default
function loadChartData() {
  var now = Math.floor(Date.now() / 1000);
  var thirtyDaysAgo = now - (30 * 24 * 60 * 60);

  // Pre-fill date inputs if present
  var today = new Date();
  var from = new Date();
  from.setDate(today.getDate() - 30);
  var toEl = document.getElementById('chartDateTo');
  var fromEl = document.getElementById('chartDateFrom');
  if (toEl && !toEl.value) toEl.value = today.toISOString().split('T')[0];
  if (fromEl && !fromEl.value) fromEl.value = from.toISOString().split('T')[0];

  fetchChartHistory(thirtyDaysAgo, now, 'day', function (arr) {
    if (arr.length === 0) {
      // Nothing from API — show empty chart with a status message
      chartData = { labels: [], usd: [], jod: [] };
      renderChart();
      setChartStatus('No history data available');
      return;
    }
    chartData = parseHistoryToChartData(arr, 'day');
    renderChart();
    setChartStatus('');
  });

  // Schedule auto-refresh every 1 hour
  setInterval(function () {
    var nowTs = Math.floor(Date.now() / 1000);
    var fromTs = nowTs - (30 * 24 * 60 * 60);
    fetchChartHistory(fromTs, nowTs, 'day', function (arr) {
      if (arr.length === 0) return;
      chartData = parseHistoryToChartData(arr, 'day');
      renderChart();
    });
  }, HISTORY_CACHE_TTL);
}

function renderChart() {
  var canvas = document.getElementById('priceChart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var isJOD = currentCurrency === 'JOD';
  var prices = isJOD ? chartData.jod : chartData.usd;
  var sym = isJOD ? 'JD' : '$';

  var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(201,149,42,0.3)');
  gradient.addColorStop(1, 'rgba(201,149,42,0.0)');

  if (priceChart) {
    priceChart.data.labels = chartData.labels;
    priceChart.data.datasets[0].data = prices;
    priceChart.data.datasets[0].label = 'XAU (' + sym + ')';
    priceChart.update();
    return;
  }

  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'XAU (' + sym + ')',
        data: prices,
        borderColor: '#C9952A',
        borderWidth: 2.5,
        fill: true,
        backgroundColor: gradient,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#C9952A',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(28,26,20,0.9)',
          titleColor: '#E8B84B',
          bodyColor: '#FBF6EC',
          borderColor: 'rgba(201,149,42,0.3)',
          borderWidth: 1,
          callbacks: {
            label: function (ctx) { return ' ' + sym + ' ' + parseFloat(ctx.raw).toFixed(2); }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(201,149,42,0.06)' },
          ticks: { color: '#7A7060', font: { size: 11 }, maxTicksLimit: 6 }
        },
        y: {
          grid: { color: 'rgba(201,149,42,0.06)' },
          ticks: {
            color: '#7A7060', font: { size: 11 },
            callback: function (v) { return sym + ' ' + v; }
          }
        }
      },
      interaction: { intersect: false, mode: 'index' }
    }
  });
}

function toggleChart(cur, btn) {
  var btns = document.querySelectorAll('.ctoggle');
  btns.forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  currentCurrency = cur;
  updateChartCurrency();
}

function updateChartCurrency() {
  if (!priceChart) return;
  var isJOD = currentCurrency === 'JOD';
  var prices = isJOD ? chartData.jod : chartData.usd;
  var sym = isJOD ? 'JD' : '$';
  priceChart.data.datasets[0].data = prices;
  priceChart.data.datasets[0].label = 'XAU (' + sym + ')';
  priceChart.options.scales.y.ticks.callback = function (v) { return sym + ' ' + v; };
  priceChart.update();
}

// ---- CHART STATUS HELPER -----------------------------------------------------------------------------------------
function setChartStatus(msg) {
  var el = document.getElementById('chartStatus');
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

// ---- CHART DATE FILTER — re-fetches from API for any date range -----------------------------------------------------------------------------------------
function filterChartByDate() {
  var fromEl = document.getElementById('chartDateFrom');
  var toEl = document.getElementById('chartDateTo');
  if (!fromEl || !toEl) return;

  var fromVal = fromEl.value; // "YYYY-MM-DD"
  var toVal = toEl.value;

  // Determine timestamps
  var startTs, endTs;
  var now = Math.floor(Date.now() / 1000);

  if (fromVal) {
    startTs = Math.floor(new Date(fromVal).getTime() / 1000);
  } else {
    startTs = now - (30 * 24 * 60 * 60);
  }

  if (toVal) {
    // End of that day
    endTs = Math.floor(new Date(toVal + 'T23:59:59').getTime() / 1000);
  } else {
    endTs = now;
  }

  // Choose groupBy based on range size
  var rangeDays = (endTs - startTs) / (60 * 60 * 24);
  var groupBy = 'day';
  if (rangeDays > 365 * 3) groupBy = 'month';
  else if (rangeDays > 365) groupBy = 'week';

  setChartStatus('Loading...');

  fetchChartHistory(startTs, endTs, groupBy, function (arr) {
    if (arr.length === 0) {
      setChartStatus('No data for selected range');
      return;
    }
    chartData = parseHistoryToChartData(arr, groupBy);
    renderChart();
    setChartStatus('');
  });
}

function resetChartFilter() {
  var fromEl = document.getElementById('chartDateFrom');
  var toEl = document.getElementById('chartDateTo');
  var today = new Date();
  var from = new Date();
  from.setDate(today.getDate() - 30);
  if (fromEl) fromEl.value = from.toISOString().split('T')[0];
  if (toEl) toEl.value = today.toISOString().split('T')[0];
  filterChartByDate();
}

// ---- CALCULATOR --------------------------------------------------------------------------------------------------------
function calculate() {
  var weightEl = document.getElementById('calcWeight');
  var karatEl = document.getElementById('calcKarat');
  var resultEl = document.getElementById('calcResult');
  if (!weightEl || !karatEl || !resultEl) return;

  var weight = parseFloat(weightEl.value);
  var karat = parseInt(karatEl.value);

  if (!weight || weight <= 0) {
    resultEl.textContent = 'Enter weight and karat to calculate value';
    return;
  }

  var gramPrice = getKaratPrice(currentOzPriceUSD, karat);
  var total = gramPrice * weight;
  var sym = currentCurrency === 'JOD' ? 'JD' : '$';
  var converted = convertPrice(total);

  resultEl.innerHTML =
    weight + 'g of ' + karat + 'K gold = ' +
    '<strong style="color:var(--gold)">' + sym + ' ' + converted.toFixed(2) + '</strong>' +
    ' &nbsp;·&nbsp; ' +
    '<small style="color:var(--muted)">' + sym + ' ' + convertPrice(gramPrice).toFixed(2) + '/g</small>';
}