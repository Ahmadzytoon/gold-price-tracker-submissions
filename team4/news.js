const API_KEY = "383394a005fb0343cbc064d48b7d44f6";

const CACHE_TIME = 15 * 60 * 1000;

function fetchNews() {
    const url = `https://corsproxy.io/?https://gnews.io/api/v4/search?q="gold price" OR XAU OR bullion&lang=en&max=10&apikey=${API_KEY}`;

    function isGoldNews(article) {
        const text = (article.title + " " + (article.description || "")).toLowerCase();
        return (
            (text.includes("gold") || text.includes("xau") || text.includes("bullion")) &&
            !text.includes("medal") && !text.includes("olympic")
        );
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {

            if (!data.articles || data.articles.length === 0) {
                document.getElementById("mainNews").innerHTML = "No news found 😢";
                return;
            }

            let articles = data.articles;

            articles = articles.filter(isGoldNews);
            articles = articles.filter(a => a.image);
            articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

            localStorage.setItem("goldNews", JSON.stringify(articles));
            localStorage.setItem("goldNewsTime", Date.now());

            showMainNews(articles[0]);
            showNews(articles.slice(1));
        })
        .catch(err => {
            console.error("Error fetching news:", err);
        });
}

function loadFromStorage() {
    const savedNews = localStorage.getItem("goldNews");
    const savedTime = localStorage.getItem("goldNewsTime");

    if (savedNews && savedTime) {
        const now = Date.now();

        if (now - savedTime < CACHE_TIME) {
            const articles = JSON.parse(savedNews);

            showMainNews(articles[0]);
            showNews(articles.slice(1));

            return true;
        }
    }

    return false;
}

function showMainNews(article) {
    const container = document.getElementById("mainNews");

    container.innerHTML = `
        <img src="${article.image}">
        <h2>${article.title}</h2>
        <p>${article.description || ""}</p>
        <div class="time">${new Date(article.publishedAt).toLocaleString()}</div>
        <a href="${article.url}" target="_blank">Read more →</a>
    `;
}

function showNews(articles) {
    const container = document.getElementById("newsList");
    container.innerHTML = "";

    articles.forEach(a => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <img src="${a.image}"
              class="w-100" 
               style="height:180px; object-fit:cover; border-radius:8px 8px 0 0;"
               onerror="this.src='/media/fallbackImge.avif'">
            <h3>${a.title}</h3>
            <div class="time">${new Date(a.publishedAt).toLocaleString()}</div>
            <a href="${a.url}" target="_blank">Read more →</a>
        `;

        container.appendChild(div);
    });
}

if (!loadFromStorage()) {
    fetchNews();
}

setInterval(fetchNews, CACHE_TIME);