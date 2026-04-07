// News: Using GNews API
// IDEAS TO NOT HARDCODE: 
// 1. Fetch from a secure backend endpoint where the key is stored securely.
// 2. Use a build pipeline (e.g. Webpack/Vite) with an .env file for environment variables.
var NEWS_API_KEY = '4607e42e4f5637b49a3af563e17e42b2';
var NEWS_API_URL = 'https://gnews.io/api/v4/search?q=gold+price+OR+gold+market+OR+gold+forecast&lang=en&max=9&apikey=' + NEWS_API_KEY;

// ---- NEWS CAROUSEL -----------------------------------------------------------------------------------------------------------
var newsCarouselIndex = 0;
var newsArticlesData = []; // Store full article data for modal

async function loadNews() {
  var grid = document.getElementById('newsGrid');
  if (!grid) return;

  var savedNewsStr = localStorage.getItem('savedGoldNewsV3');
  var savedNewsTime = localStorage.getItem('savedGoldNewsTimeV3');
  var now = new Date().getTime();

  // Check if we have saved news from less than 1 hour ago (3600000 ms)
  if (savedNewsStr && savedNewsTime && (now - parseInt(savedNewsTime)) < 3600000) {
    try {
      var cachedData = JSON.parse(savedNewsStr);
      if (cachedData && cachedData.articles) {
        renderNews(cachedData.articles);
        return;
      }
    } catch (e) {
      console.warn("Failed to parse cached news", e);
    }
  }


  try {
    const res = await fetch(NEWS_API_URL);
    const data = await res.json();
    if (data && data.articles && data.articles.length) {
      // Cache the result in localStorage
      localStorage.setItem('savedGoldNewsV3', JSON.stringify(data));
      localStorage.setItem('savedGoldNewsTimeV3', now.toString());
      renderNews(data.articles);
    } else {
      renderFallbackNews();
    }
  } catch (error) {
    console.warn("Error fetching news:", error);
    renderFallbackNews();
  }
}

function renderNews(articles) {
  var grid = document.getElementById('newsGrid');
  if (!grid) return;

  // Store full article data for modal
  newsArticlesData = articles.map(function (a) {
    return {
      title: a.title || 'Gold Market Update',
      description: a.description || '',
      content: a.content || '',
      image: a.image || '',
      url: a.url || '#',
      source: (a.source && a.source.name) ? a.source.name : 'Market News',
      date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '',
      dateShort: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
    };
  });

  var html = newsArticlesData.map(function (a, i) {
    var imgHtml = a.image
      ? '<img src="' + a.image + '" alt="" class="news-img" onerror="this.style.display=\'none\'">'
      : '<div class="news-img"></div>';
    return '<div class="news-card" onclick="openNewsModal(' + i + ')">' +
      '<div class="news-card-inner">' +
      imgHtml +
      '<div class="news-body">' +
      '<div class="news-source">' + a.source + '</div>' +
      '<div class="news-headline">' + a.title + '</div>' +
      '<div class="news-date">' + a.dateShort + '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }).join('');
  grid.innerHTML = html;
  updateCardSizes();
  newsCarouselIndex = 0;
  updateNewsCarousel();
  initNewsArrows();
}

function renderFallbackNews() {
  var grid = document.getElementById('newsGrid');
  if (!grid) return;

  newsArticlesData = [
    {
      title: 'Gold prices hold near record highs as dollar weakens against major currencies',
      description: 'Gold prices remained near record levels on Friday as the U.S. dollar continued its descent against a basket of major currencies, making the precious metal more attractive to international buyers.',
      content: 'Spot gold was trading at $3,085.20 per ounce, just shy of the all-time high of $3,102 set earlier this week. The dollar index fell 0.3% to its lowest in two months, providing additional tailwinds for bullion.',
      image: '../assets/images/old-news.png',
      url: '#',
      source: 'Reuters',
      date: 'Monday, March 31, 2026',
      dateShort: 'Mar 31, 2026'
    },
    {
      title: 'Central bank gold purchases reach five-year high in Q1 2026, boosting demand outlook',
      description: 'Central banks around the world bought a combined 290 tonnes of gold in the first quarter of 2026, marking the highest quarterly purchase volume since the World Gold Council began tracking data.',
      content: 'Led by purchases from China, India, and Turkey, the surge in central bank demand underscores a growing preference for gold as a reserve asset amid geopolitical uncertainty and de-dollarization trends.',
      image: '../assets/images/old-news.png',
      url: '#',
      source: 'Bloomberg',
      date: 'Sunday, March 30, 2026',
      dateShort: 'Mar 30, 2026'
    },
    {
      title: 'XAU/USD technical analysis: Bulls maintain control above key support at $3,000/oz',
      description: 'Gold\'s technical picture remains strongly bullish as prices consolidate above the psychological $3,000 level, with multiple indicators pointing to further upside potential.',
      content: 'The 50-day moving average continues to trend higher, providing dynamic support near $2,980. RSI readings suggest the metal is not yet overbought on the daily timeframe, leaving room for additional gains toward $3,150.',
      image: '../assets/images/old-news.png',
      url: '#',
      source: 'FXStreet',
      date: 'Saturday, March 29, 2026',
      dateShort: 'Mar 29, 2026'
    },
    {
      title: 'Gold ETF inflows surge as investors seek safe-haven assets amid market volatility',
      description: 'Exchange-traded funds backed by gold saw their largest monthly inflows in over three years during March 2026, as investors rotated out of equities and into safe-haven assets.',
      content: 'Total holdings in gold ETFs rose by 45 tonnes during the month, bringing the global total to 3,450 tonnes. North American funds led the inflows, accounting for nearly 60% of the net additions.',
      image: '../assets/images/old-news.png',
      url: '#',
      source: 'CNBC',
      date: 'Friday, March 28, 2026',
      dateShort: 'Mar 28, 2026'
    },
    {
      title: 'Middle East gold demand rises as regional currencies face fresh headwinds',
      description: 'Gold demand across the Middle East has risen sharply as several regional currencies came under pressure against the U.S. dollar, driving consumers toward traditional store-of-value assets.',
      content: 'Jewelry and investment demand in Jordan, Egypt, and the UAE increased by an estimated 18% year-over-year in Q1 2026, according to regional bullion dealers.',
      image: '../assets/images/old-news.png',
      url: '#',
      source: 'Al Arabiya',
      date: 'Thursday, March 27, 2026',
      dateShort: 'Mar 27, 2026'
    },
    {
      title: 'Silver and gold rally pushes precious metals sector to new quarterly records',
      description: 'A broad rally in precious metals pushed the sector to record quarterly gains, with silver surging alongside gold as industrial and investment demand converged.',
      content: 'Silver prices rose 12% during Q1 2026, reaching $36.50 per ounce, while gold gained 8% to close the quarter above $3,050. Platinum and palladium also posted gains of 5% and 3% respectively.',
      image: '../assets/images/old-news.png',
      url: '#',
      source: 'Kitco',
      date: 'Wednesday, March 26, 2026',
      dateShort: 'Mar 26, 2026'
    },
    {
      title: 'Geopolitical tensions boost safe-haven appeal of gold in European markets',
      description: 'European demand for physical gold surged this week as investors sought protection amid escalating geopolitical tensions over trade routes and energy supply constraints.',
      content: 'Major European bullion dealers reported a 30% increase in retail sales of coins and small bars. Market participants point to a general lack of confidence in fiat currencies amid shifting international dynamics.',
      image: '../assets/images/old-news.png',
      url: '#',
      source: 'Financial Times',
      date: 'Tuesday, March 25, 2026',
      dateShort: 'Mar 25, 2026'
    },
    {
      title: 'Analysts project gold will surpass $3,200 by year-end on monetary policy shifts',
      description: 'Several major investment banks have upgraded their gold price forecasts, predicting the metal could exceed $3,200 per ounce before the end of the year if central banks scale back tightening.',
      content: 'The revised forecasts hinge on expectations that inflationary pressures will moderate, prompting a pause in rate hikes that would reduce the opportunity cost of holding non-yielding bullion.',
      image: '../assets/images/old-news.png',
      url: '#',
      source: 'Wall Street Journal',
      date: 'Monday, March 24, 2026',
      dateShort: 'Mar 24, 2026'
    },
    {
      title: 'Mining sector stocks lag physical gold as operational costs squeeze margins',
      description: 'Despite record high gold prices, stocks of major mining companies have underperformed the physical metal due to stubbornly high energy and equipment costs.',
      content: 'Gold miners report that aggressive inflation in input materials like diesel and explosives has offset much of the revenue gained from rising gold prices, frustrating equity investors.',
      image: '../assets/images/old-news.png',
      url: '#',
      source: 'MarketWatch',
      date: 'Sunday, March 23, 2026',
      dateShort: 'Mar 23, 2026'
    }
  ];

  var html = newsArticlesData.map(function (n, i) {
    return '<div class="news-card" onclick="openNewsModal(' + i + ')">' +
      '<div class="news-card-inner">' +
      '<div class="news-img" style="display:flex;align-items:center;justify-content:center"><img src="' + n.image + '" alt="News" class="news-img"></div>' +
      '<div class="news-body">' +
      '<div class="news-source">' + n.source + '</div>' +
      '<div class="news-headline">' + n.title + '</div>' +
      '<div class="news-date">' + n.dateShort + '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }).join('');
  grid.innerHTML = html;
  updateCardSizes();
  newsCarouselIndex = 0;
  updateNewsCarousel();
  initNewsArrows();
}

// ── News Modal ──────────────────────────────────────────────

var globalNewsModalInstance = null;

function openNewsModal(index) {
  var article = newsArticlesData[index];
  if (!article) return;

  var modalEl = document.getElementById('newsModal');
  if (!modalEl) return;

  if (!globalNewsModalInstance) {
    globalNewsModalInstance = new bootstrap.Modal(modalEl);
  }

  var imgEl = document.getElementById('newsModalImg');
  imgEl.src = article.image || '';
  imgEl.style.display = article.image ? '' : 'none';
  document.getElementById('newsModalSource').textContent = article.source;
  document.getElementById('newsModalDate').textContent = article.date;
  document.getElementById('newsModalTitle').textContent = article.title;
  document.getElementById('newsModalDesc').textContent = article.description;

  var linkEl = document.getElementById('newsModalLink');
  if (article.url && article.url !== '#') {
    linkEl.href = article.url;
    linkEl.style.display = 'inline-block';
  } else {
    linkEl.style.display = 'none';
  }

  globalNewsModalInstance.show();
}

// ── Carousel Navigation ─────────────────────────────────────

function getVisibleNewsCount() {
  return window.innerWidth <= 768 ? 1 : 3;
}

function updateCardSizes() {
  var viewport = document.querySelector('.news-viewport');
  var cards = document.querySelectorAll('.news-card, .news-skeleton');
  if (!viewport || !cards.length) return;

  var visible = getVisibleNewsCount();
  var cardWidth = viewport.offsetWidth / visible;

  cards.forEach(function (card) {
    card.style.width = cardWidth + 'px';
    card.style.minWidth = cardWidth + 'px';
    card.style.maxWidth = cardWidth + 'px';
  });
}

function getCardSlideWidth() {
  var viewport = document.querySelector('.news-viewport');
  if (!viewport) return 300;
  var vpWidth = viewport.offsetWidth;
  var visible = getVisibleNewsCount();
  // gap is 0, cards use internal padding; each card = vpWidth / visible
  return vpWidth / visible;
}

function getMaxNewsIndex() {
  var grid = document.getElementById('newsGrid');
  if (!grid) return 0;
  var total = grid.children.length;
  var visible = getVisibleNewsCount();
  return Math.max(0, total - visible);
}

function updateNewsCarousel() {
  var grid = document.getElementById('newsGrid');
  if (!grid) return;
  var slideWidth = getCardSlideWidth();
  var offset = newsCarouselIndex * slideWidth;
  grid.style.transform = 'translateX(-' + offset + 'px)';

  // Update arrow states
  var leftBtn = document.getElementById('newsArrowLeft');
  var rightBtn = document.getElementById('newsArrowRight');
  if (leftBtn) {
    leftBtn.style.opacity = newsCarouselIndex <= 0 ? '0.35' : '1';
    leftBtn.style.pointerEvents = newsCarouselIndex <= 0 ? 'none' : 'auto';
  }
  if (rightBtn) {
    var maxIdx = getMaxNewsIndex();
    rightBtn.style.opacity = newsCarouselIndex >= maxIdx ? '0.35' : '1';
    rightBtn.style.pointerEvents = newsCarouselIndex >= maxIdx ? 'none' : 'auto';
  }
}

function initNewsArrows() {
  var leftBtn = document.getElementById('newsArrowLeft');
  var rightBtn = document.getElementById('newsArrowRight');

  if (leftBtn && !leftBtn._bound) {
    leftBtn.addEventListener('click', function () {
      if (newsCarouselIndex > 0) {
        newsCarouselIndex--;
        updateNewsCarousel();
      }
    });
    leftBtn._bound = true;
  }

  if (rightBtn && !rightBtn._bound) {
    rightBtn.addEventListener('click', function () {
      if (newsCarouselIndex < getMaxNewsIndex()) {
        newsCarouselIndex++;
        updateNewsCarousel();
      }
    });
    rightBtn._bound = true;
  }

  updateNewsCarousel();
}

// Recalculate on resize
window.addEventListener('resize', function () {
  updateCardSizes();
  var maxIdx = getMaxNewsIndex();
  if (newsCarouselIndex > maxIdx) newsCarouselIndex = maxIdx;
  updateNewsCarousel();
});

