const API_KEY = "adc044aa94f98ff30f56c24d60529bf8";
const API_URL = `https://gnews.io/api/v4/search?q=gold+price+market&lang=en&apikey=${API_KEY}`;
const REFRESH_INTERVAL = 15 * 60 * 1000;
const CACHE_KEY = 'gold_news_cache';

function adjustSpeed(element) {
    const duration = element.textContent.length * 0.05;
    element.style.animationDuration = duration + "s";
}


async function fetchNews() {
    const tickerContent = document.getElementById('news-ticker');

    if (!tickerContent) {
        console.warn("news-ticker element not found");
        return;
    }

    const cachedNews = localStorage.getItem(CACHE_KEY);
    if (cachedNews) {
        tickerContent.innerHTML = cachedNews;
        adjustSpeed(tickerContent);
    }

    try {
        const response = await fetch(API_URL);

        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            const headlines = data.articles.map(function (a) {
                return `<i class="fa-solid fa-bullhorn ms-4 me-2 text-gold"></i> ${a.title}`;
            }).join(" &nbsp;&nbsp;&nbsp;&nbsp; ");

            const longHeadlines = headlines + " &nbsp;&nbsp;&nbsp;&nbsp; " + headlines + " &nbsp;&nbsp;&nbsp;&nbsp; " + headlines;

            localStorage.setItem(CACHE_KEY, longHeadlines);

            tickerContent.innerHTML = longHeadlines;
            adjustSpeed(tickerContent);
        }
    } catch (err) {

        console.error("News fetch failed:", err);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        fetchNews();
        setInterval(fetchNews, REFRESH_INTERVAL);
    });
} else {
    fetchNews();
    setInterval(fetchNews, REFRESH_INTERVAL);
}