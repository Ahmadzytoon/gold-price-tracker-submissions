const firstline = document.getElementById("line_1")
const secondline = document.getElementById("line_2")
const thirdline = document.getElementById("line_3")
const slider = document.getElementById("newsslider")
const vab= document.getElementById("botton_assets")
let dates = [];
let currency = "dollar";
if (localStorage.getItem("dates") === null) {
    dates = [];
    console.log("There is no date");
} else {
    dates = JSON.parse(localStorage.getItem("dates"));
    console.log("There is date");
}

function addData(data) {
    const datejs = new Date(data.updatedAt);
    
    dates.push({
        year: datejs.getFullYear(),
        month: datejs.getMonth() + 1,
        day: datejs.getDate(),
        hours: datejs.getHours(),
        minuts: datejs.getMinutes(),
        price: data.price
    });
    if(dates.length>=30){
        dates.shift()
    }
    localStorage.setItem("dates", JSON.stringify(dates));
    
}

document.addEventListener("click", (e) => {
    if (e.target.closest("#dollar")) {
        currency = "dollar";
        updateUI(currency);
        document.getElementById("dollar").classList.add("selected");
        document.getElementById("jod").classList.remove("selected");
    } 
    else if (e.target.closest("#jod")) {
        currency = "jod";
        updateUI(currency);
        document.getElementById("jod").classList.add("selected");
        document.getElementById("dollar").classList.remove("selected");
    }
});

function calculateProfit(asset) {
    let current = calculateCurrentValue(asset);
    let profit = current - asset.price;
    return (profit >= 0 ? "+ " : "")  + profit.toFixed(2) + " $";
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

function calculatePercentage(asset) {
    let current = calculateCurrentValue(asset);
    let profit = current - asset.price;
    let percent = (profit / asset.price) * 100;
    return (profit >= 0 ? "+" : "") + percent.toFixed(1) + "%";
}



function addAssetsCards() {
    
let assetsContainer = document.getElementById("assetsContainer");
    
    assetsContainer.innerHTML = "";

    let index=0;
     if(localStorage.getItem("isLoggedIn") !== "true"){
            assetsContainer.innerHTML = `<div class="no_assests">Please Login to view or add assets</div>`;
            vab.style.display="none";
        }
        else{
            vab.style.display="block";
            let currentUser = localStorage.getItem("currentUser");
            let assets = JSON.parse(localStorage.getItem("assets")) || [];
            let userAssets = assets.filter(asset => asset.user === currentUser);
        for (const asset of userAssets){
            if(index>=3){
                break;
            }
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
                    <p id="current_value">$${calculateCurrentValue(asset)}</p>
                </div>
            </div>
            <hr>
            <div class="card_bottom_line">
                <div class="data_info">
                    <sub> PROFIT/LOSS</sub>
                    <p id="prof_value">${calculateProfit(asset)}</p>
                </div>
                <div id="percentage_value">${calculatePercentage(asset)}</div>
            </div>
            
        `;

       
        assetsContainer.appendChild(card);
        index++;
    };
        }
    
}



function updateUI(currency) {
    if (currency === "dollar") {
        document.getElementById("price-ounce").innerText = "$" + dollar_24k_ounce;
        document.getElementById("price-24k").innerText = "$" + dollar_24k_1gram;
        document.getElementById("price-21k").innerText = "$" + dollar_21k_1gram;
        document.getElementById("price-18k").innerText = "$" + dollar_18k_1gram;
        document.getElementById("rashadi").innerHTML = "$" + dollar_21k_rashadiCoin;
        document.getElementById("english_coin").innerHTML = "$" + dollar_21k_englishCoin;
        document.getElementById("1kg_bar").innerHTML="$" + dollar_1kg_bar;
    } else if (currency === "jod") {
        document.getElementById("price-ounce").innerText = jod_24k_ounce + " JOD";
        document.getElementById("price-24k").innerText = jod_24k_1gram + " JOD";
        document.getElementById("price-21k").innerText = jod_21k_1gram + " JOD";
        document.getElementById("price-18k").innerText = jod_18k_1gram + " JOD";
        document.getElementById("rashadi").innerHTML = jod_21k_rashadiCoin + " JOD";
        document.getElementById("english_coin").innerHTML = jod_21k_englishCoin + " JOD";
        document.getElementById("1kg_bar").innerHTML = jod_1kg_bar + " JOD";
    }
}

async function startApp() {
    try {
        let data = await fetchGold();
        console.log("the data is :", data);
        getAllKirates();
        
        addData(data);
        updateUI(currency);
        addAssetsCards()

        setInterval(async () => {
            let newData = await fetchGold();
            console.log(dates)
            getAllKirates();
            addData(newData); 
            updateUI(currency);
            addAssetsCards()
        }, 60000); 

    } catch (error) {
    }
}

startApp();
firstline.addEventListener("click", ()=>{
    slider.style.transform = "translateX(0%)";
});

secondline.addEventListener("click", ()=>{
    slider.style.transform = "translateX(-100%)";
});

thirdline.addEventListener("click", ()=>{
    slider.style.transform = "translateX(-200%)";
});
