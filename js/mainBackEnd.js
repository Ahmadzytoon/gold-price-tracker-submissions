let dollar_24k_ounce = 0;
let dollar_24k_1gram = 0;
let dollar_21k_1gram = 0;
let dollar_18k_1gram = 0;
let dollar_21k_rashadiCoin = 0;
let dollar_21k_englishCoin = 0;
let dollar_1kg_bar = 0;

let jod_24k_ounce = 0;
let jod_24k_1gram = 0;
let jod_21k_1gram = 0;
let jod_18k_1gram = 0;
let jod_21k_rashadiCoin = 0;
let jod_21k_englishCoin = 0;
let jod_1kg_bar=0;

// function to get 2 decimal of the nuumer 
function format(num) {
    return Math.round(num * 100) / 100;
}


//  function to convert to jod
function convert_to_jod(num) {
    return (num * 0.709);
}

//this function fetchs gold price from API
async function fetchGold() {

    //the api returns this object
    //     {
    //   "currency": "USD",
    //   "currencySymbol": "$",
    //   "exchangeRate": 1,
    //   "name": "Gold",
    //   "price": 4670.5,
    //   "symbol": "XAU",
    //   "updatedAt": "2026-03-31T18:59:10Z",
    //   "updatedAtReadable": "a few seconds ago"
    // } 
    try {
        const res = await fetch('https://api.gold-api.com/price/XAU');
        const data = await res.json();

        dollar_24k_ounce = data.price;
        dollar_24k_ounce = format(dollar_24k_ounce);

        console.log(dollar_24k_ounce + " this is ounce");
        return data;
        
        

    } catch (err) {
        console.error(err);
    }
}

// function to get all kirates prices in dol and jod
function getAllKirates() {

    dollar_24k_1gram = format(dollar_24k_ounce / 31.1035);
    dollar_21k_1gram = format(dollar_24k_1gram * 0.875);
    dollar_18k_1gram = format(dollar_24k_1gram * 0.75);
    dollar_1kg_bar = format(dollar_24k_1gram*1000)

    jod_24k_ounce = format(convert_to_jod(dollar_24k_ounce));
    jod_24k_1gram = format(convert_to_jod(dollar_24k_1gram));
    jod_21k_1gram = format(convert_to_jod(dollar_21k_1gram));
    jod_18k_1gram = format(convert_to_jod(dollar_18k_1gram));
    jod_1kg_bar=format(convert_to_jod(dollar_1kg_bar))

    dollar_21k_englishCoin = format(dollar_21k_1gram * 8);
    dollar_21k_rashadiCoin = format(dollar_21k_1gram * 7);

    jod_21k_rashadiCoin = format(jod_21k_1gram * 7);
    jod_21k_englishCoin = format(jod_21k_1gram * 8);
    

    // console.log("24K:", dollar_24k_1gram);
    // console.log("21K:", dollar_21k_1gram);
    // console.log("18K:", dollar_18k_1gram);
    // console.log("24K_jod:", jod_24k_1gram);
    // console.log("21K_jod:", jod_21k_1gram);
    // console.log("18K_jod:", jod_18k_1gram);
    // console.log(dollar_21k_englishCoin);
    // console.log(dollar_21k_rashadiCoin);
    // console.log(jod_21k_englishCoin);
    // console.log(jod_21k_rashadiCoin);



}




async function main() {
    await fetchGold();
    getAllKirates();
}
//  main()




