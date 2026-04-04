const url = 'https://gnews.io/api/v4/search?q=XAU&lang=en&apikey=19d9c9ef408649625ed381b1ff5efd9f';

const container = document.querySelector('#newsDetails');

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

async function getNews() {
  try {
    container.innerHTML = '<p>Loading...</p>';
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0] || 'API Error');
    }

    displayNews(data.articles || []);
  } catch (error) {
    console.error('ERROR:', error);
    container.innerHTML = `<p>${error.message}</p>`;
  }
}

function displayNews(articles) {
  container.innerHTML = '';

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const div = document.createElement('div');
    div.classList.add('news-card', 'mb-4');

    div.innerHTML = `
      <img src="${article.image || 'https://via.placeholder.com/300'}" class="img-fluid rounded mb-2">
      <h5>${article.title}</h5>
      <p>${article.description || 'No description available'}</p>
      <a href="${article.url}" target="_blank" class="btn btn-gold">Read More</a>
    `;

    container.appendChild(div);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  updateHeader();
  getNews();
  setInterval(getNews, 300000);
});
