/*
  1--- categories select fill 
  2--- prevent submition if any field in the form not filled 
  3-- image default 
  4-- stor in localstorage 
  5-- calculations 
*/

let categoriesSelect = document.querySelector(".category-select");
let typesSelect = document.querySelector(".type-select");

let categoriesArray = {
    Jewelry: ["Ring", "Bracelet", "Earrings", "Pendant"],
    Bars: ["1 kg Bar", "100 g Bar", "Bullion Bar"],
    Coins: ["Bullion Coin", "Commemorative Coin", "Collector Coin"]
};

categoriesSelect.innerHTML = '<option selected disabled>choose category</option>';

typesSelect.addEventListener("change", function (e) {
    categoriesSelect.innerHTML = "";
    let selectedType = e.currentTarget.value;
    
    if (categoriesArray[selectedType]) {
        categoriesArray[selectedType].forEach(category => {
            let option = document.createElement("option");
            option.textContent = category;
            option.value = category; 
            categoriesSelect.appendChild(option);
        });
    }
   
});

let submitBtn = document.querySelector(".submit-btn");
let assetsForm = document.querySelector(".assets-form");
let imageUpload = document.querySelector(".image-upload");
let karatSelect = document.querySelector(".karat-select");
let weightInput = document.querySelector(".weight-input");
let priceInput = document.querySelector(".price-input");
let priceDate = document.querySelector(".price-date");
let gramPrice = document.querySelector(".gram-price-input");
let currency = document.querySelector(".currency-select");
let cardsContainer = document.querySelector(".cards");

let assetsStorage = [];

function compressImage(file, maxWidth = 400, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
        };
        reader.onerror = error => reject(error);
    });
}

async function getGoldPricePerGram() {
    try {
        let response = await fetch("https://api.gold-api.com/price/XAU");
        let data = await response.json();
        let priceUSDPerOunce = data.price;
        const OUNCE_TO_GRAM = 31.1035;

        if (currency.value === "JOD") {
            const USD_TO_JOD = 0.71;
            return (priceUSDPerOunce * USD_TO_JOD) / OUNCE_TO_GRAM;
        } else {
            return priceUSDPerOunce / OUNCE_TO_GRAM;
        }
    } catch (err) {
        console.error("Error fetching gold price:", err);
        return 75; 
    }
}

// التعامل مع إرسال النموذج
assetsForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    let imageFile;
    if (imageUpload.files.length > 0) {
        imageFile = await compressImage(imageUpload.files[0], 400, 0.6);
    } else {
        imageFile = "../assets/images/Gold.png";
    }

    let price24K = await getGoldPricePerGram();

    let purchaseValue = parseFloat(weightInput.value) * parseFloat(gramPrice.value);
    let currentPricePerGram = price24K * (parseInt(karatSelect.value) / 24);
    let currentValue = parseFloat(weightInput.value) * currentPricePerGram;
    let profitOrLoss = currentValue - purchaseValue;

    let assetData = {
        id: Date.now(),
        userId: sessionStorage.getItem("userId"),
        img: imageFile,
        type: typesSelect.value,
        category: categoriesSelect.value,
        karat: karatSelect.value,
        weight: weightInput.value,
        price: priceInput.value,
        date: priceDate.value,
        currency: currency.value,
        purchaseValue,
        currentValue,
        profitOrLoss
    };

    assetsStorage = JSON.parse(localStorage.getItem("Users Assets")) || [];
    assetsStorage.push(assetData);
    localStorage.setItem("Users Assets", JSON.stringify(assetsStorage));

    addcard(assetData);

    Swal.fire({
        title: "Asset Added!",
        text: "Your gold asset has been saved successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        iconColor: '#f3c623',
    });

    assetsForm.reset();
    categoriesSelect.innerHTML = '<option selected disabled>choose category</option>';
});

function addcard(asset) {
    let profitColor = asset.profitOrLoss >= 0 ? 'text-success' : 'text-danger';
    let sign = asset.profitOrLoss >= 0 ? '+' : '';
    let percentage = (asset.profitOrLoss / asset.purchaseValue) * 100;

    const cardHTML = `
        <div class="col-12 col-sm-6 col-xxl-4">
            <div class="glass-card overflow-hidden h-100 shadow-sm" style="border-radius: 15px; border: 1px solid #ddd; background: white;">
                <img src="${asset.img}" class="asset-img" style="width: 100%; height: 200px; object-fit: cover;">
                <div class="p-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-warning text-dark">${asset.karat}K</span>
                    </div>
                    <h5 class="fw-bold">${asset.category}</h5>
                    <p class="text-muted small mb-3">${asset.type} • ${asset.weight}g</p>
                    
                    <div class="bg-light p-3 rounded-3 mb-3 border">
                        <div class="d-flex justify-content-between mb-1">
                            <small class="text-muted">Current Value:</small>
                            <span class="fw-bold">${asset.currentValue.toFixed(2)} ${asset.currency}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <small class="text-muted">Profit/Loss:</small>
                            <span class="${profitColor} fw-bold">
                                ${sign}${asset.profitOrLoss.toFixed(2)} ${asset.currency} (${percentage.toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${asset.date}</small>
                        <button onclick="deleteAsset(${asset.id})" class="btn btn-sm btn-outline-danger px-3">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    cardsContainer.insertAdjacentHTML("afterbegin", cardHTML);
}

window.addEventListener("DOMContentLoaded", () => {
    const currentUserId = sessionStorage.getItem("userId");
    let allAssets = JSON.parse(localStorage.getItem("Users Assets")) || [];
    let userSpecificAssets = allAssets.filter(asset => asset.userId == currentUserId);
    userSpecificAssets.forEach(asset => addcard(asset));
});

function deleteAsset(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f3c623',
        cancelButtonColor: '#333',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            let assets = JSON.parse(localStorage.getItem("Users Assets")) || [];
            assets = assets.filter(asset => asset.id !== id);
            localStorage.setItem("Users Assets", JSON.stringify(assets));
            location.reload();
        }
    });
}

function filterAssets() {
    let query = document.querySelector(".category-search").value.toLowerCase().trim();
    let selectedType = document.querySelector(".type-search").value;

    let currentUserId = sessionStorage.getItem("userId");
    let allAssets = JSON.parse(localStorage.getItem("Users Assets")) || [];

    let filtered = allAssets.filter(asset => {
        let isSameUser = asset.userId == currentUserId;

        let matchesSearch =
            asset.category.toLowerCase().includes(query) ||
            asset.type.toLowerCase().includes(query) ||
            asset.karat.toString().toLowerCase().includes(query);

        let matchesType = (selectedType === "All" || selectedType === "") || 
                          asset.type.trim().toLowerCase() === selectedType.trim().toLowerCase();

        return isSameUser && matchesSearch && matchesType;
    });

    cardsContainer.innerHTML = "";
    filtered.forEach(asset => addcard(asset));
}

document.querySelector(".category-search").addEventListener("input", filterAssets);
document.querySelector(".type-search").addEventListener("change", filterAssets);