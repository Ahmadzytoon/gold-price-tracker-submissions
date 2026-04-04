// localStorage.removeItem("assets");
// console.log("main is:", typeof main);
// main ();

let asset2_value=0;
let asset2_profit=0;
let totalValue=document.getElementById("total_value");
let totalProfit=document.getElementById("total_profit");
let gold_price=document.getElementById("gold_price");
let searchInput = document.getElementById("searchInput");
let typeSelect = document.getElementById("typeSelect");
let kiratSelect = document.getElementById("kiratSelect");
function addAssetsCards() {
     asset2_value=0;
 asset2_profit=0;
    
let assetsContainer = document.getElementById("assetsContainer");
    
    assetsContainer.innerHTML = "";

    let currentUser = localStorage.getItem("currentUser");
    let assets = JSON.parse(localStorage.getItem("assets")) || [];
let userAssets = assets.filter(asset => asset.user === currentUser);
   userAssets.forEach((asset, index) => {

     let searchValue = searchInput.value.toLowerCase();
    let selectedType = typeSelect.value;
    let selectedKirat = kiratSelect.value;

   
    if (!asset.name.toLowerCase().includes(searchValue)) return;

  
    if (selectedType !== "All" && asset.type !== selectedType) return;

   
    if (selectedKirat !== "All" && asset.kirat !== selectedKirat) return;

        let currentValue = calculateCurrentValue(asset);
    let profit = currentValue - asset.price;
    let percent = (profit / asset.price) * 100;

    asset2_value += currentValue;
    asset2_profit += profit;
        
        let card = document.createElement("div");
        card.classList.add("first_card");

        card.innerHTML = `
        
            <img src="${asset.image}" >
            <div class="card_first_line">
                <div class="tit_subTit">
                    <div> ${asset.name}  </div>
                    <sub>${asset.type}</sub>
                </div>
                <div id="card_kirat">${asset.kirat}</div>
            </div>
            <div class="card_second_line">
                <div class="data_info">
                    <sub> WEIGHT</sub>
                    <p>${asset.weight}g</p>
                </div>
                <div class="data_info">
                    <sub> PURCHASE DATE</sub>
                    <p>${new Date(asset.date).toLocaleDateString("en-US", { month:"short", day:"2-digit", year:"numeric" })}</p>
                </div>
            </div>
            <div class="card_third_line">
                <div class="data_info">
                    <sub> PURCHASE PRICE</sub>
                    <p>$${asset.price.toLocaleString()}</p>
                </div>
                <div class="data_info">
                    <sub> CURRENT VALUE</sub>
                    <p id="current_value">$${currentValue.toFixed(2)}</p>
                </div>
            </div>
            <hr>
            <div class="card_bottom_line">
                <div class="data_info">
                    <sub> PROFIT/LOSS</sub>
                    <p id="prof_value">${(profit >= 0 ? "+ " : "") + profit.toFixed(2)}</p>
                </div>
                <div id="percentage_value">${(profit >= 0 ? "+" : "") + percent.toFixed(1)} %</div>
            </div>
            <button class="delete_btn" id="delete_btn" onclick="deleteAsset(${index})">Delete Asset</button>
        `;

       
        assetsContainer.appendChild(card);
    });
}


function calculateCurrentValue(asset) {
    let result;
    if (asset.kirat==="24k")
    {
        console.log("in 24k value of gram is "+ dollar_24k_1gram)
        result= asset.weight * dollar_24k_1gram;
        
    }
    else if(asset.kirat==="21k")
        {result=asset.weight * dollar_21k_1gram;}
    else
    {
      result=asset.weight * dollar_18k_1gram;  
    }

    
    return result;

}

// function calculateProfit(asset) {
//     let current = calculateCurrentValue(asset);
//     let profit = current - asset.price;
//     asset2_profit+=profit;
//     return (profit >= 0 ? "+ " : "")  + profit.toFixed(2) + " $";
// }

// function calculatePercentage(asset) {
//     let current = calculateCurrentValue(asset);
//     let profit = current - asset.price;
//     let percent = (profit / asset.price) * 100;
//     return (profit >= 0 ? "+" : "") + percent.toFixed(1) + "%";
// }


document.addEventListener("DOMContentLoaded", async () => {
    await main();        // get prices
    addAssetsCards();    // render cards
    updateAsset2();

});

// update every 10 sec
setInterval(async () => {
    await main();
    addAssetsCards();
    updateAsset2();
}, 10000);



searchInput.addEventListener("input", addAssetsCards);
typeSelect.addEventListener("change", addAssetsCards);
kiratSelect.addEventListener("change", addAssetsCards);
function updateAsset2(){
    totalValue.textContent=asset2_value.toFixed(2);
    totalProfit.textContent=asset2_profit.toFixed(2);
    gold_price.textContent=dollar_24k_ounce.toFixed(2);
}

function deleteAsset(index) {

    if (!confirm("Are you sure you want to delete this asset?")) return;
    let currentUser = localStorage.getItem("currentUser");
    let assets = JSON.parse(localStorage.getItem("assets")) || [];

    let userAssets = assets.filter(asset => asset.user === currentUser);

    let assetToDelete = userAssets[index];

    
    assets = assets.filter(asset => asset !== assetToDelete);

    localStorage.setItem("assets", JSON.stringify(assets));

    addAssetsCards();
    updateAsset2();
}

