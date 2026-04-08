// Get form
const form = document.getElementById('assetForm'); 

// Get logged-in user
const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
if (!loggedInUser) {
  // Redirect to login if not logged in
  window.location.href = 'login.html';
  throw new Error('User not logged in');
}
const userEmail = loggedInUser.email;
const storageKey = 'goldAssets_' + userEmail;

// Get inputs
const saveButton       = document.getElementById('saveBtn');
const assetTypeInput    = document.getElementById('assetType');
const karatInput        = document.getElementById('karat');
const categoryInput     = document.getElementById('category');
const weightInput       = document.getElementById('weight');
const purchasePriceInput= document.getElementById('price');
const purchaseDateInput = document.getElementById('date');
const imageInput        = document.getElementById('image');
const addAssetBtn = document.getElementById('add-asset-btn');
const AddAssetsDiv = document.querySelector('.addAssets');
// Get error spans 
const assetTypeError = document.getElementById('assetTypeError');
const karatError     = document.getElementById('karatError');
const categoryError  = document.getElementById('categoryError');
const weightError    = document.getElementById('weightError');
const priceError     = document.getElementById('priceError');
const dateError      = document.getElementById('dateError');
const imageError     = document.getElementById('imageError');

const specialChars = /[^a-zA-Z0-9 ]/;

function showError(span, message) {
  span.textContent = message;
  span.style.display = 'block';
}

function clearError(span) {
  span.textContent = '';
  span.style.display = 'none';
}

form.addEventListener('submit', function(event) {
  event.preventDefault();
  let isValid = true; 

  // --- Asset Type ---
  if (assetTypeInput.value === '') {
    showError(assetTypeError, 'Please select an asset type.');
    isValid = false;
  } else {
    clearError(assetTypeError);
  }

  // --- Karat ---
  if (karatInput.value === '') {
    showError(karatError, 'Please select a karat.');
    isValid = false;
  } else {
    clearError(karatError);
  }

  // --- Category ---
  const categoryVal = categoryInput.value.trim();
  if (categoryVal === '') {
    showError(categoryError, 'Please enter a category.');
    isValid = false;
  } else if (categoryVal.length < 3) {
    showError(categoryError, 'Category must be at least 3 characters.');
    isValid = false;
  } else if (specialChars.test(categoryVal)) {
    showError(categoryError, 'Special characters are not allowed.');
    isValid = false;
  } else {
    clearError(categoryError);
    categoryInput.style.borderColor = 'green';
  }

  // --- Weight ---
  const weightVal = parseFloat(weightInput.value);
  if (weightInput.value === '' || weightVal <= 0) {
    showError(weightError, 'Please enter a valid weight greater than 0.');
    isValid = false;
  } else {
    clearError(weightError);
  }

  // --- Price ---
  if (purchasePriceInput.value === '') {
    showError(priceError, 'Please enter a valid price.');
    isValid = false;
  } else if (parseFloat(purchasePriceInput.value) > 1000000) {
    showError(priceError, 'Price cannot be greater than 1,000,000.');
    isValid = false;
  } else {
    clearError(priceError);
  }

  // --- Date ---
  if (purchaseDateInput.value === '') {
    showError(dateError, 'Please select a purchase date.');
    isValid = false;
  } else {
    const selectedDate = new Date(purchaseDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      showError(dateError, 'Purchase date cannot be in the future.');
      isValid = false;
    } else {
      clearError(dateError);
    }
  }

// --- Image ---
const imageFile = imageInput.files[0];
if (!imageFile) {
  showError(imageError, 'Please select an image.');
  isValid = false;
} else {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(imageFile.type)) {
    showError(imageError, 'Only JPG, PNG, or WEBP images allowed.');
    isValid = false;
  } else if (imageFile.size > 5 * 1024 * 1024) {
    showError(imageError, 'Image must be under 5MB.');
    isValid = false;
  } else {
    clearError(imageError);
  }
}

  // Stop here if anything failed
  if (!isValid) return;

  // Validation passed — now save
  const file = imageInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const newAsset = {
      id: Date.now(),
      type: assetTypeInput.value,
      karat: karatInput.value,
      category: categoryInput.value,
      weight: weightInput.value,
      price: purchasePriceInput.value,
      date: purchaseDateInput.value,
      image: e.target.result
    };
    saveToLocalStorage(newAsset);
    renderCard(newAsset);
  };

  reader.readAsDataURL(file);
});
function renderCard(asset) {
  const cardContainer = document.getElementById('assetList');
  const card = document.createElement('div');
  card.classList.add('gold-card');

  // Calculate profit/loss
  const pl = calculateProfitLoss(asset);
  const plHTML = pl
    ? `<div class="profit-loss ${pl.isProfit ? 'profit' : 'loss'}">
         <span>${pl.isProfit ? '▲' : '▼'} ${pl.isProfit ? '+' : ''}${pl.percentage}%</span>
         <small>Current Value: $${pl.currentValue}</small>
       </div>`
    : `<div class="profit-loss neutral">Price data unavailable</div>`;

  card.innerHTML = `
    <div class="card-image">
      <img src="${asset.image || 'placeholder.png'}" alt="${asset.category}">
    </div>
    <div class="card-content">
      <h3>${asset.category} <span class="karat-badge">${asset.karat}</span></h3>
      <div class="card-stats">
        <p><strong>Weight:</strong> ${asset.weight}g</p>
        <p><strong>Paid:</strong> $${asset.price}</p>
        <p><strong>Date:</strong> ${asset.date}</p>
      </div>
      ${plHTML}
      <button class="delete-btn" onclick="deleteAsset(${asset.id})">Remove</button>
    </div>
  `;

  cardContainer.appendChild(card);
}
function saveToLocalStorage(newAsset) {
    // 1. Retrieve the existing string data from storage
    const existingData = localStorage.getItem(storageKey);

    // 2. Convert the string back into a JS Array (or start with an empty one if null)
    let assetsArray = existingData ? JSON.parse(existingData) : [];

    // 3. Add our new validated asset object to the list
    assetsArray.push(newAsset);

    // 4. Turn the updated list back into a string and save it to the browser
    localStorage.setItem(storageKey, JSON.stringify(assetsArray));
    
    console.log("Asset saved successfully! Total items:", assetsArray.length);
}
function deleteAsset(id) {
    // 1. Load current assets
    const existingData = localStorage.getItem(storageKey);
    let assetsArray = existingData ? JSON.parse(existingData) : [];

    // 2. Filter out the deleted one
    assetsArray = assetsArray.filter(asset => asset.id !== id);

    // 3. Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(assetsArray));

    // 4. Remove the card from the DOM
    document.getElementById('assetList').innerHTML = '';
    assetsArray.forEach(asset => renderCard(asset));
}
//------------------------------------------------------------------------------------
// Get search elements
const searchInput = document.getElementById('searchInput');
const searchKarat = document.getElementById('searchKarat');
const searchType  = document.getElementById('searchType');

// Guard — stop if any search element is missing
if (searchInput && searchKarat && searchType) {
  searchInput.addEventListener('input', filterAssets);
  searchKarat.addEventListener('change', filterAssets);
  searchType.addEventListener('change', filterAssets);
}
// Listen for changes on all three filters
searchInput.addEventListener('input', filterAssets);
searchKarat.addEventListener('change', filterAssets);
searchType.addEventListener('change', filterAssets);

function filterAssets() {
  const searchText  = searchInput.value.trim().toLowerCase();
  const karatVal    = searchKarat.value;
  const typeVal     = searchType.value;

  // Load all assets from localStorage
  const existingData = localStorage.getItem(storageKey);
  const assetsArray  = existingData ? JSON.parse(existingData) : [];

  // AND logic — asset must pass every active filter
  const filtered = assetsArray.filter(asset => {
    const matchesText  = searchText === '' || asset.category.toLowerCase().includes(searchText);
    const matchesKarat = karatVal === 'all'  || asset.karat === karatVal;
    const matchesType  = typeVal  === 'all'  || asset.type  === typeVal;

    return matchesText && matchesKarat && matchesType;
  });

  // Re-render only the filtered cards
  const cardContainer = document.getElementById('assetList');
  cardContainer.innerHTML = '';
  filtered.forEach(asset => renderCard(asset));
}
//------------------------------------------------------------------------------------

// Hide the form on page load
AddAssetsDiv.classList.add('hidden');

addAssetBtn.addEventListener('click', () => {
    AddAssetsDiv.classList.toggle('hidden');

    // Only scroll into view when opening, not closing
    if (!AddAssetsDiv.classList.contains('hidden')) {
        AddAssetsDiv.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
});

// Map each karat to its purity ratio
const karatPurity = {
  '24K': 24 / 24,
  '22K': 22 / 24,
  '21K': 21 / 24,
  '18K': 18 / 24,
  '14K': 14 / 24
};

function getCurrentGramPrice(karat) {
  const stored = JSON.parse(localStorage.getItem('gold_prices'));
  if (!stored) return null;

  // Always calculate in USD
  const gram24K = stored.USD.gram24K;
  const purity  = karatPurity[karat];

  if (!purity) return null;
  return gram24K * purity;
}

function calculateProfitLoss(asset) {
  const currentGramPrice = getCurrentGramPrice(asset.karat);
  if (!currentGramPrice) return null;

  const currentValue  = currentGramPrice * parseFloat(asset.weight);
  const purchasePrice = parseFloat(asset.price);
  const profitLoss    = currentValue - purchasePrice;
  const percentage    = ((profitLoss / purchasePrice) * 100).toFixed(2);

  return {
    currentValue: currentValue.toFixed(2),
    profitLoss:   profitLoss.toFixed(2),
    percentage,
    isProfit: profitLoss >= 0
  };
}

// Load existing assets on page start
window.addEventListener('load', function () {
    const existingData = localStorage.getItem(storageKey);
    if (existingData) {
        const assetsArray = JSON.parse(existingData);
        assetsArray.forEach(asset => renderCard(asset));
    }
});