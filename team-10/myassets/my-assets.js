const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (isLoggedIn !== 'true') {
    
    alert("Access Denied. Please login to view your assets.");
    window.location.href = '../login.html'; 
}
document.addEventListener("DOMContentLoaded", () => {
 
  
  const form = document.getElementById("addAssetForm");
  const searchInput = document.getElementById("searchInput");
  const filterType = document.getElementById("filterType");

  
  form.addEventListener("submit", handleFormSubmit);
  
  
  searchInput.addEventListener("input", displayAssets);
  filterType.addEventListener("change", displayAssets);

  
  displayAssets();


  
  function handleFormSubmit(event) {
    event.preventDefault(); 

    const photoInput = document.getElementById("assetPhoto");
    const file = photoInput.files[0]; 

    
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        saveDataToStorage(e.target.result); 
      };
      reader.readAsDataURL(file);
    } else {
      
      const defaultImage = "https://placehold.co/150x150/EDE8D8/B07D1A?text=No+Photo";
      saveDataToStorage(defaultImage);
    }
  }

  function saveDataToStorage(imageString) {
    const newAsset = {
      id: Date.now(),
      type: document.getElementById("assetType").value,
      karat: parseInt(document.getElementById("assetKarat").value),
      weight: parseFloat(document.getElementById("assetWeight").value),
      name: document.getElementById("assetName").value,
      purchasePrice: parseFloat(document.getElementById("assetPrice").value),
      purchaseDate: document.getElementById("assetDate").value,
      image: imageString
    };

    let myAssets = JSON.parse(localStorage.getItem("userGoldAssets")) || [];
    myAssets.push(newAsset);
    localStorage.setItem("userGoldAssets", JSON.stringify(myAssets));

    form.reset();
    displayAssets(); 
  }


  
  function displayAssets() {
    const container = document.getElementById("assetsContainer");
    let myAssets = JSON.parse(localStorage.getItem("userGoldAssets")) || [];

    const searchText = searchInput.value.toLowerCase();
    const filterValue = filterType.value;

    
    let filteredAssets = myAssets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchText);
      const matchesType = filterValue === "All" || asset.type === filterValue;
      return matchesSearch && matchesType;
    });

    container.innerHTML = ""; 

    if (filteredAssets.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h4>No assets found</h4>
          <p>Try a different search or add a new item.</p>
        </div>`;
      return;
    }

  
    const liveOuncePrice = parseFloat(localStorage.getItem("liveGoldPrice")) || 0;
    const gramPrice24K = liveOuncePrice / 31.1035;

    filteredAssets.forEach((asset) => {
      const currentGramPrice = gramPrice24K * (asset.karat / 24);
      const currentTotalValue = currentGramPrice * asset.weight;
      
      const profitLossAmount = currentTotalValue - asset.purchasePrice;
      const isProfit = profitLossAmount >= 0;
      
      
      const badgeBg = isProfit ? "var(--profit-bg)" : "var(--loss-bg)";
      const badgeColor = isProfit ? "var(--profit-text)" : "var(--loss-text)";
      const statusText = isProfit ? "Profit" : "Loss";

      
      const cardHTML = `
        <div class="form-box" style="padding: 15px; margin-bottom: 15px;">
          <img src="${asset.image}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;" alt="Gold Asset">
          
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
            <h4 style="margin: 0; font-size: 1.1rem; color: var(--text-primary);">${asset.name}</h4>
            <span style="background-color: var(--warm-grey); padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
              ${asset.karat}K ${asset.type}
            </span>
          </div>
          
          <p style="margin: 0 0 15px 0; font-size: 0.85rem; color: var(--text-muted);">
            Purchased: ${asset.purchaseDate} | Weight: ${asset.weight}g
          </p>
          
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 5px;">
            <span style="color: var(--text-muted);">Purchase Price:</span>
            <strong>$${asset.purchasePrice.toFixed(2)}</strong>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 15px;">
            <span style="color: var(--text-muted);">Current Value:</span>
            <strong>$${currentTotalValue.toFixed(2)}</strong>
          </div>

          <div style="background-color: ${badgeBg}; color: ${badgeColor}; padding: 10px; border-radius: 6px; text-align: center; font-weight: bold; font-size: 0.95rem;">
            ${statusText}: $${Math.abs(profitLossAmount).toFixed(2)}
          </div>
        </div>
      `;

      container.innerHTML += cardHTML;
    });
  }

});