
// **************Handling Asset form***********
let addAssetForm = document.getElementById("addAssetForm");
let input1_assetName = document.getElementById("input1_assetName");
let input2_kirat = document.getElementById("input2_kirat");
let input3_assetType = document.getElementById("input3_assetType");
let input7_weight = document.getElementById("input7_weight");
let input8_purchasePrice = document.getElementById("input8_purchasePrice");
let input9_purchaseDate = document.getElementById("input9_purchaseDate");
let input10_assetImage = document.getElementById("input10_assetImage");

let input3_assetType_Coins = document.getElementById("input3_assetType_Coins");
let input3_assetType_Bars = document.getElementById("input3_assetType_Bars");

let input4 = document.getElementsByClassName("input4")[0];//BIG DIV jewelry types
let input5 = document.getElementsByClassName("input5")[0];//BIG DIV coins types
let input6 = document.getElementsByClassName("input6")[0];//BIG DIV gold Bars types

let input4_typeJewlery = document.getElementById("input4_typeJewlery");//Select jewelry types
let input5_typeCoins = document.getElementById("input5_typeCoins");//Select coins types
let input6_typeBars = document.getElementById("input6_typeBars");//Select gold Bars typess

let closeAssetBtn=document.getElementById("closeAssetBtn");

let input1_Small = document.getElementById("input1_Small");
let input2_Small = document.getElementById("input2_Small");
let input3_Small = document.getElementById("input3_Small");
let input4_Small = document.getElementById("input4_Small");
let input5_Small = document.getElementById("input5_Small");
let input6_Small = document.getElementById("input6_Small");
let input7_Small = document.getElementById("input7_Small");
let input8_Small = document.getElementById("input8_Small");
let input9_Small = document.getElementById("input9_Small");
let input10_Small = document.getElementById("input10_Small");

let imagePath;
let selectedDate = new Date(input9_purchaseDate.value);
let today = new Date();
today.setHours(0, 0, 0, 0);

input2_kirat.addEventListener("change", () => {
    //  hide all 
    input3_assetType_Coins.classList.add("d-none");
    input3_assetType_Bars.classList.add("d-none");

    input4.classList.add("d-none");
    input5.classList.add("d-none");
    input6.classList.add("d-none");

    //remove selected prev
    input3_assetType.selectedIndex = 0;

    //  reset weight
    input7_weight.disabled = false;
    input7_weight.value = "";

    // Then show what i need 
    if (input2_kirat.value === "24k") {
        input3_assetType_Bars.classList.remove("d-none");

    } else if (input2_kirat.value === "21k") {
        input3_assetType_Coins.classList.remove("d-none");

    }

});

input3_assetType.addEventListener("change", () => {
    //hide all
    input4.classList.add("d-none");
    input5.classList.add("d-none");
    input6.classList.add("d-none");

    //remove selected prev
    input4_typeJewlery.selectedIndex = 0;
    input5_typeCoins.selectedIndex = 0;
    input6_typeBars.selectedIndex = 0;

    //  reset weight
    input7_weight.disabled = false;
    input7_weight.value = "";

    // Then show what i need 
    if (input3_assetType.value === "Jewelry") {
        input4.classList.remove("d-none");
    }

    else if (input3_assetType.value === "Coins") {
        input5.classList.remove("d-none");
    }
    else if (input3_assetType.value === "Gold_bars") {
        input6.classList.remove("d-none");
    }
});

input4_typeJewlery.addEventListener("change", () => {
    input7_weight.disabled = false;
    input7_weight.value = "";

});

input5_typeCoins.addEventListener("change", () => {
    input7_weight.disabled = false;
    input7_weight.value = "";
    if (input5_typeCoins.value === "eCoin") {
        input7_weight.disabled = true;
        input7_weight.value = 8;
    }
    else if (input5_typeCoins.value === "rCoin") {
        input7_weight.disabled = true;
        input7_weight.value = 7;
    }
});

input6_typeBars.addEventListener("change", () => {
    input7_weight.disabled = false;
    input7_weight.value = "";
    if (input6_typeBars.value === "one_bullion") {
        input7_weight.disabled = true;
        input7_weight.value = 1000;
    }
    else if (input6_typeBars.value === "one_ounce") {
        input7_weight.disabled = true;
        input7_weight.value = 31.10;
    }
    else if (input6_typeBars.value === "half_ounce") {
        input7_weight.disabled = true;
        input7_weight.value = 15.55;
    }
    else {
        input7_weight.disabled = false;
        input7_weight.value = "";
    }

});

addAssetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let saveToform = true;

    if (input1_assetName.value.trim() === "") {
        showError(input1_assetName, "Asset Name cannot be empty");
        saveToform = false;
    } else {
        clearError(input1_assetName);
    }


    if (!input2_kirat.value) {
        showError(input2_kirat, "Please select a Kirat");
        saveToform = false;
    } else {
        clearError(input2_kirat);
    }

    if (!input3_assetType.value) {
        showError(input3_assetType, "Please select an Asset Type");
        saveToform = false;
    } else {
        clearError(input3_assetType);
    }

    if (input3_assetType.value === "Jewelry") {
        if (!input4_typeJewlery.value) {
            showError(input4_typeJewlery, "Please select a Jewelry Type");
            saveToform = false;
        } else clearError(input4_typeJewlery);
    }

    if (input3_assetType.value === "Coins") {
        if (!input5_typeCoins.value) {
            showError(input5_typeCoins, "Please select a Coin Type");
            saveToform = false;
        } else clearError(input5_typeCoins);
    }

    if (input3_assetType.value === "Gold_bars") {
        if (!input6_typeBars.value) {
            showError(input6_typeBars, "Please select a Gold Bar Type");
            saveToform = false;
        } else clearError(input6_typeBars);
    }
    if (!input7_weight.value || Number(input7_weight.value) <= 0) {
        showError(input7_weight, "Weight cannot be empty or less than 1 gram");
        saveToform = false;
    } else {
        clearError(input7_weight);
    }
    if (!input8_purchasePrice.value || Number(input8_purchasePrice.value) <= 0) {
        showError(input8_purchasePrice, "Purchase Price cannot be empty or less than 1");
        saveToform = false;
    } else {
        clearError(input8_purchasePrice);
    }

    if (!input9_purchaseDate.value) {
        showError(input9_purchaseDate, "Please select a Purchase Date");
        saveToform = false;

    } else if (selectedDate > today) {
        showError(input9_purchaseDate, "Date cannot be in the future");
        saveToform = false;

    } else {
        clearError(input9_purchaseDate);
    }
    if (input10_assetImage.files.length > 0) {
        imagePath = URL.createObjectURL(input10_assetImage.files[0]);


    } else {
        imagePath = getDefaultImage();

    }

    if (saveToform) {
        let currentUser = localStorage.getItem("currentUser");
        let asset = {
            name: input1_assetName.value,
            kirat: input2_kirat.value,
            type: input3_assetType.value,
            weight: Number(input7_weight.value),
            price: Number(input8_purchasePrice.value),
            date: input9_purchaseDate.value,
            image: imagePath,
            user: currentUser 
        };
        let assets = JSON.parse(localStorage.getItem("assets")) || [];
        assets.push(asset);
        localStorage.setItem("assets", JSON.stringify(assets));

        addAssetsCards();
        let modalElement = document.getElementById("addAssetModal");
        let modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        
        addAssetForm.reset();
    }
   
})

function showError(input, message) {
    let small = input.parentElement.querySelector("small");
    small.textContent = message;
    small.style.color = "red";
}

function clearError(input) {
    let small = input.parentElement.querySelector("small");
    small.textContent = "";
}
function getDefaultImage() {

    // Jewelry
    if (input3_assetType.value === "Jewelry") {
        if (input4_typeJewlery.value === "ring") return "/images/Rings.png";
        if (input4_typeJewlery.value === "bracelet") return "/images/Bracelet.png";
        if (input4_typeJewlery.value === "necklace") return "/images/Necklace.png";
        if (input4_typeJewlery.value === "earrings") return "/images/Earring.png";
        return "/images/heroGold.jpeg";
    }

    // Coins
    if (input3_assetType.value === "Coins") {
        if (input5_typeCoins.value === "eCoin") return "/images/English.png";
        if (input5_typeCoins.value === "rCoin") return "/images/Rashadi_Gold.png";
        return "/images/heroGold.jpeg";
    }

    // Bars
    if (input3_assetType.value === "Gold_bars") {
        if (input6_typeBars.value === "one_bullion") return "/images/Fine_Gold_1Kilo.png";
        if (input6_typeBars.value === "one_ounce") return "/images/Fine_Gold_10Kilo.png";
        if (input6_typeBars.value === "half_ounce") return "/images/F Fine_Gold_5Kilo.png";
        return "/images/heroGold.jpeg";
    }

    return "/images/heroGold.jpeg";
}

closeAssetBtn.addEventListener("click",()=>{
    addAssetForm.reset();
})
