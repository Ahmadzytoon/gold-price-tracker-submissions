let sliderArticles = [];
let currentSlideIndex = 0;
let slideInterval;

async function fetchNews() {
    const url = `https://newsapi.org/v2/everything?q=Gold exchange&pageSize=10&apiKey=473c2c01c5f84cf892fb798eb9bb9196`; 
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.articles && data.articles.length > 0) {
            displayNewsSlider(data.articles);
        } else {
            showErrorMessage("No articles found.");
        }
    } catch (err) {
        console.error("Error fetching news:", err);
        showErrorMessage("Failed to load news. Please try again.");
    }
}

function displayNewsSlider(articles) {
    sliderArticles = articles.slice(0, 3);
    
    const sliderContainer = document.getElementById('newsslider');
    const paginationContainer = document.getElementById('news-pagination');
    
    if (!sliderContainer || !paginationContainer) return;

    sliderContainer.innerHTML = '';
    paginationContainer.innerHTML = '';

    const fallbackImg = 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=60';

    sliderArticles.forEach((article, index) => {
        const imageUrl = article.urlToImage || article.image || fallbackImg;

        const imgDiv = document.createElement('div');
        imgDiv.className = 'news_1'; 
        imgDiv.id = `newsimg${index}`;
        imgDiv.style.display = index === 0 ? 'block' : 'none'; 
        imgDiv.innerHTML = `<img src="${imageUrl}" alt="${article.title}" onerror="this.src='${fallbackImg}'" style="width: 100%; height: 100%; object-fit: cover;">`;
        sliderContainer.appendChild(imgDiv);

        const line = document.createElement('span');
        line.className = `line line_${index + 1} ${index === 0 ? 'active' : ''}`;
        line.id = `line_${index}`;
        line.onclick = () => goToSlide(index);
        paginationContainer.appendChild(line);
    });

    updateSlideContent(0);
    startAutoSlide();
}

function updateSlideContent(index) {
    const titleEl = document.getElementById('news-title');
    const linkEl = document.getElementById('news-link');
    
    if(sliderArticles[index]) {
        titleEl.textContent = sliderArticles[index].title;
        linkEl.href = sliderArticles[index].url || '#';
    }
}

function goToSlide(index) {
    document.getElementById(`newsimg${currentSlideIndex}`).style.display = 'none';
    document.getElementById(`line_${currentSlideIndex}`).classList.remove('active');

    currentSlideIndex = index;

    document.getElementById(`newsimg${currentSlideIndex}`).style.display = 'block';
    document.getElementById(`line_${currentSlideIndex}`).classList.add('active');

    updateSlideContent(currentSlideIndex);
    resetAutoSlide();
}

function startAutoSlide() {
    slideInterval = setInterval(() => {
        let nextIndex = (currentSlideIndex + 1) % sliderArticles.length;
        goToSlide(nextIndex);
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

function showErrorMessage(msg) {
    const titleEl = document.getElementById('news-title');
    if (titleEl) {
        titleEl.textContent = msg;
    }
}

fetchNews();