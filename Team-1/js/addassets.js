const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

if (!currentUser) {
  alert('Please login first ❌');
  window.location.href = 'Login.html';
}

function getAssetsKey() {
  return 'assets_' + currentUser.id;
}

function getAssets() {
  const data = localStorage.getItem(getAssetsKey());
  return data ? JSON.parse(data) : [];
}

function saveAssets(assets) {
  localStorage.setItem(getAssetsKey(), JSON.stringify(assets));
}

function fixDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function getHistory() {
  let history = [];

  try {
    history = JSON.parse(localStorage.getItem('goldHistory')) || [];
  } catch (e) {
    history = [];
  }

  const arr = [];

  for (let i = 0; i < history.length; i++) {
    const one = history[i];
    const day = fixDate(one.day);
    const maxPrice = Number(one.max_price);

    if (day && !isNaN(maxPrice)) {
      arr.push({
        day: day,
        max_price: maxPrice,
      });
    }
  }

  return arr;
}

function findPriceByDate(date) {
  const target = fixDate(date);
  if (!target) return null;

  const history = getHistory();
  if (!history.length) return null;

  for (let i = 0; i < history.length; i++) {
    if (history[i].day === target) {
      return history[i].max_price;
    }
  }

  let nearest = null;
  const targetTime = new Date(target).getTime();

  for (let i = 0; i < history.length; i++) {
    const itemTime = new Date(history[i].day).getTime();

    if (itemTime <= targetTime) {
      if (nearest === null || itemTime > new Date(nearest.day).getTime()) {
        nearest = history[i];
      }
    }
  }

  if (nearest) return nearest.max_price;
  return null;
}

function calcBuyPrice(weight, karat, buyDate) {
  const ouncePrice = findPriceByDate(buyDate);
  if (ouncePrice === null) return null;

  const gram24 = ouncePrice / 31.1035;
  const gramPrice = gram24 * (Number(karat) / 24);
  return gramPrice * Number(weight);
}

const form = document.getElementById('goldForm');
const buyDateInput = document.getElementById('buyDate');
const priceInput = document.getElementById('price');
const priceNote = document.getElementById('priceNote');

if (buyDateInput) {
  buyDateInput.max = new Date().toISOString().split('T')[0];
  buyDateInput.value = buyDateInput.max;
}

function updateCalculatedBuyPrice() {
  const weight = Number(document.getElementById('weight').value);
  const karat = Number(document.getElementById('karat').value);
  const buyDate = buyDateInput.value;

  if (!weight || !karat || !buyDate) {
    if (priceNote) priceNote.textContent = 'Select weight, karat, and buy date.';
    return;
  }

  const calculatedBuyPrice = calcBuyPrice(weight, karat, buyDate);

  if (!Number.isFinite(calculatedBuyPrice)) {
    if (priceNote) {
      priceNote.textContent = 'No gold history found for this date. Enter your own price.';
    }
    return;
  }

  if (document.activeElement !== priceInput || !priceInput.value) {
    priceInput.value = calculatedBuyPrice.toFixed(2);
  }

  if (priceNote) {
    const ouncePrice = findPriceByDate(buyDate);
    priceNote.textContent = `Suggested by gold price on ${buyDate}: $${Number(ouncePrice).toFixed(2)} / oz`;
  }
}

['weight', 'karat', 'buyDate'].forEach(function (id) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('input', updateCalculatedBuyPrice);
    element.addEventListener('change', updateCalculatedBuyPrice);
  }
});

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const weight = Number(document.getElementById('weight').value);
  const karat = Number(document.getElementById('karat').value);
  const buyDate = buyDateInput.value;
  const suggestedBuyPrice = calcBuyPrice(weight, karat, buyDate);
  const buyPrice = Number(priceInput.value);

  if (!name) {
    alert('Enter asset name ❌');
    return;
  }

  if (!Number.isFinite(weight) || weight <= 0) {
    alert('Enter valid weight ❌');
    return;
  }

  if (!Number.isFinite(karat) || karat <= 0) {
    alert('Select valid karat ❌');
    return;
  }

  if (!buyDate) {
    alert('Select buy date ❌');
    return;
  }

  if (!Number.isFinite(buyPrice) || buyPrice <= 0) {
    alert('Enter a valid buy price ❌');
    return;
  }

  const asset = {
    id: Date.now(),
    name: name,
    weight: weight,
    karat: karat,
    buyDate: buyDate,
    buyPrice: Number(buyPrice.toFixed(2)),
    suggestedBuyPrice: Number.isFinite(suggestedBuyPrice)
      ? Number(suggestedBuyPrice.toFixed(2))
      : null,
  };

  const assets = getAssets();
  assets.push(asset);
  saveAssets(assets);

  alert('Asset saved ✅');
  window.location.href = 'Assets.html';
});

updateCalculatedBuyPrice();
