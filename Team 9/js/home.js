let newsArticles = [];
let myChart = null;
let newsSwiper = null;

async function startHomePage() {
  await fetchGoldPrice();
  updatePriceDisplay();
  updateRatesDisplay();
  loadChart();
  await loadNews();

  setInterval(async function () {
    await fetchGoldPrice();
    updatePriceDisplay();
    updateRatesDisplay();
    updateChart();
  }, UPDATE_INTERVAL);
}

function updatePriceDisplay() {
  document.getElementById("ounce-price").textContent =
    formatPrice(currentOuncePrice);
  document.getElementById("ounce-price-sub").textContent =
    (currentOuncePrice * JOD_RATE).toFixed(2) + " JOD / oz";
  document.getElementById("last-updated").textContent =
    "Updated: " + new Date().toLocaleTimeString();
}

function updateRatesDisplay() {
  document.getElementById("price-24k").textContent = formatPrice(
    getKaratPrice("24"),
  );
  document.getElementById("price-21k").textContent = formatPrice(
    getKaratPrice("21"),
  );
  document.getElementById("price-18k").textContent = formatPrice(
    getKaratPrice("18"),
  );
  document.getElementById("price-rashadi").textContent = formatPrice(
    getCoinPrice("rashadi"),
  );
  document.getElementById("price-english").textContent = formatPrice(
    getCoinPrice("english"),
  );
  document.getElementById("price-bar").textContent = formatPrice(getBarPrice());
}

function toggleCurrency(btn) {
  if (currentCurrency === "USD") {
    currentCurrency = "JOD";
    btn.textContent = "JOD";
  } else {
    currentCurrency = "USD";
    btn.textContent = "USD";
  }
  updatePriceDisplay();
  updateRatesDisplay();
}

function loadChart() {
  let history = getPriceHistory();

  let ctx = document.getElementById("priceChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: history.map((h) => h.date),
      datasets: [
        {
          label: "Gold Price (USD/oz)",
          data: history.map((h) => h.price),
          borderColor: "#c9b46a",
          backgroundColor: "rgba(245, 226, 61, 0.1)",
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#e8e4e0" } },
        tooltip: { enabled: false },
      },
      scales: {
        x: { ticks: { color: "#ffffff" }, grid: { color: "#2a2435" } },
        y: { ticks: { color: "#ffffff" }, grid: { color: "#2a2435" } },
      },
    },
  });
}

function updateChart() {
  let history = getPriceHistory();
  myChart.data.labels = history.map((h) => h.date);
  myChart.data.datasets[0].data = history.map((h) => h.price);
  myChart.update();
}

function getRandomArticles(articles, count = 6) {
  let shuffled = [...articles].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function fetchNews() {
  try {
    const res = await fetch(
      "https://newsdata.io/api/1/latest?apikey=pub_8c70cffdbf7243b487af041af698ff1a&q=gold+price+market+XAU&language=en&category=business",
    );
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("News fetch error:", err);
    return [];
  }
}

async function loadNews() {
  newsArticles = await fetchNews();

  renderNewsCards(getRandomArticles(newsArticles));

  setInterval(() => {
    renderNewsCards(getRandomArticles(newsArticles));
  }, 600000);
}

function initSwiper() {
  if (newsSwiper) {
    newsSwiper.destroy(true, true);
  }

  newsSwiper = new Swiper(".news-swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });
}

function renderNewsCards(articlesToShow) {
  let container = document.getElementById("news-cards-container");
  if (!container) return;

  if (!articlesToShow || articlesToShow.length === 0) {
    container.innerHTML =
      "<div class='swiper-slide'><p class='text-center text-muted'>No news available</p></div>";
    initSwiper();
    return;
  }

  container.innerHTML = articlesToShow
    .map(function (article) {
      let date = article.pubDate
        ? new Date(article.pubDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "";

      return (
        '<div class="swiper-slide">' +
        '<div class="news-card">' +
        '<img class="news-card-img" src="' +
        (article.image_url || "") +
        '" alt="" onerror="this.style.display=\'none\'">' +
        '<div class="news-card-body">' +
        '<div class="news-card-meta">' +
        date +
        "</div>" +
        '<div class="news-card-title">' +
        (article.title || "") +
        "</div>" +
        '<div class="news-card-desc">' +
        (article.description || "") +
        "</div>" +
        '<a href="' +
        article.link +
        '" target="_blank" rel="noopener" class="news-card-link">Read Article</a>' +
        "</div>" +
        "</div>" +
        "</div>"
      );
    })
    .join("");

  initSwiper();
}

function updateNavbar() {
  let user = getCurrentUser();
  let login = document.getElementById("nav-login");
  let logoutBtn = document.getElementById("nav-logout");
  let uname = document.getElementById("nav-username");

  if (user) {
    if (login) login.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    if (uname) {
      uname.style.display = "inline-flex";
      uname.style.alignItems = "center";
      uname.style.gap = "8px";
      uname.style.background = "rgba(201, 138, 106, 0.1)";
      uname.style.padding = "6px 14px";
      uname.style.borderRadius = "20px";
      uname.style.border = "1px solid rgba(201, 138, 106, 0.2)";
      uname.style.transition = "all 0.3s ease";

      uname.innerHTML = `<span class="fw-medium text-white" style="letter-spacing: 0.5px; font-size: 13px;">${user.name}</span>`;

      uname.onmouseover = function () {
        this.style.background = "var(--gold)";
        this.style.borderColor = "var(--gold)";
      };

      uname.onmouseout = function () {
        this.style.background = "rgba(201, 176, 106, 0.1)";
        this.style.borderColor = "rgba(183, 167, 64, 0.2)";
      };
    }
  }
}

window.onload = function () {
  updateNavbar();
  startHomePage();

  let btn = document.getElementById("currency-toggle");
  btn.addEventListener("click", function () {
    toggleCurrency(btn);
  });

  document.getElementById("nav-logout").addEventListener("click", logout);
};
