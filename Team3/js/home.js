// helper functions
function displayDiff(newPrice, prevPrice) {
  let changeOfPrice = document.getElementById("changeOfPrice");
  let diff = newPrice - prevPrice;
  let percent = ((diff / prevPrice) * 100).toFixed(2);
  if (diff > 0) {
    changeOfPrice.style.padding = "5px";
    changeOfPrice.style.fontSize = "small";
    changeOfPrice.style.color = "#4ade80";
    changeOfPrice.style.borderRadius = "20px";
    changeOfPrice.style.borderColor = "#143821";
    changeOfPrice.style.borderWidth = "1px";
    changeOfPrice.style.borderStyle = "solid";
    changeOfPrice.style.padding = "5px";
    changeOfPrice.style.margin = "10px";
    changeOfPrice.style.fontSize = "medium";
    changeOfPrice.innerText = `▲ ${percent}%  (+${Number(diff).toFixed(2)})`;
  } else {
    changeOfPrice.style.padding = "5px";
    changeOfPrice.style.fontSize = "small";
    changeOfPrice.style.color = "#de4a4a";
    changeOfPrice.style.borderRadius = "20px";
    changeOfPrice.style.borderColor = "#de4a4a";
    changeOfPrice.style.borderWidth = "1px";
    changeOfPrice.style.borderStyle = "solid";
    changeOfPrice.style.padding = "5px";
    changeOfPrice.style.margin = "10px";
    changeOfPrice.style.fontSize = "medium";
    changeOfPrice.innerText = `▼ ${percent}%  (${Number(diff).toFixed(2)})`;
  }
}

function calculatedPrices() {
  let currentPrice = Number(localStorage.getItem("currentPrice")).toFixed(2);
  let pricePerGram = currentPrice / 31.1035;
  let priceHistoryUS = JSON.parse(localStorage.getItem("priceHistory"));
  let priceHistoryJO = JSON.parse(localStorage.getItem("priceHistory")).map(
    (obj) => ({
      day: obj["day"],
      max_price: Number(obj["max_price"]) * 0.71,
    }),
  );

  let result = {
    USD: {
      current: currentPrice + " $",
      priceHistory: priceHistoryUS,
      per24k: pricePerGram.toFixed(2) + " $",
      per21k: (pricePerGram * (21 / 24)).toFixed(2) + " $",
      per18k: (pricePerGram * (18 / 24)).toFixed(2) + " $",
      bar: (pricePerGram * 10).toFixed(2) + " $",
      rashadi: (pricePerGram * 7.216 * (21.6 / 24)).toFixed(2) + " $",
      english: (pricePerGram * 7.9881 * (22 / 24)).toFixed(2) + " $",
    },
    JOD: {
      current: (currentPrice * 0.71).toFixed(2) + " JD",
      priceHistory: priceHistoryJO,
      per24k: (pricePerGram * 0.71).toFixed(2) + " JD",
      per21k: (pricePerGram * (21 / 24) * 0.71).toFixed(2) + " JD",
      per18k: (pricePerGram * (18 / 24) * 0.71).toFixed(2) + " JD",
      bar: (pricePerGram * 10 * 0.71).toFixed(2) + " JD",
      rashadi: (pricePerGram * 7.216 * (21.6 / 24) * 0.71).toFixed(2) + " JD",
      english: (pricePerGram * 7.9881 * (22 / 24) * 0.71).toFixed(2) + " JD",
    },
  };
  console.log(
    "inside calculatedPricess func: " +
      JSON.stringify(result["USD"].priceHistory),
  );
  return result;
}

function fillPrices(prices, currency = "USD") {
  let barPrice = document.getElementById("barPrice");
  let rashadiPrice = document.getElementById("rashadiPrice");
  let englishPrice = document.getElementById("EnglishPrice");
  let twentyFourPrice = document.getElementById("twentyFourPrice");
  let twentyOnePrice = document.getElementById("twentyOnePrice");
  let eighteenPrice = document.getElementById("eighteenPrice");

  barPrice.innerHTML = `${prices[currency].bar} <br><small style="color:#cbb271">24 karat - 10g </small>`;
  rashadiPrice.innerHTML = `${prices[currency].rashadi} <br> <small style="color:#cbb271">21.6 karat - 7.216g</small>`;
  englishPrice.innerHTML = `${prices[currency].english} <br><small style="color:#cbb271">22 karat - 7.9881g</small>`;
  twentyFourPrice.innerHTML = `${prices[currency].per24k} <small>/ g</small>`;
  twentyOnePrice.innerHTML = `${prices[currency].per21k} <small>/ g</small>`;
  eighteenPrice.innerHTML = `${prices[currency].per18k} <small>/ g</small>`;
  console.log("inside fillPrices func - works fine!");
}

let chartInstance = null;
function renderChart(historyData, currency = "USD") {
  const sortedData = [...historyData].reverse();

  const days = sortedData.map((item) => {
    const date = new Date(item.day);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const prices = sortedData.map((item) => Number(item.max_price).toFixed(2));

  const ctx = document.getElementById("chart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  // Gradient fill for the chart background
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(134, 89, 22, 0.3)");
  gradient.addColorStop(1, "rgba(239, 159, 39, 0)");

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: days,
      datasets: [
        {
          label: `Price (${currency}/oz)`,
          data: prices,
          borderColor: "#cbb271",
          borderWidth: 2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4, // smooth curve
          pointRadius: 2,
          pointBackgroundColor: "#cbb271",
          pointBorderColor: "#cbb271",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Prices the past 20 days - ${currency}/oz`,
          color: "#cbb271",
          font: { family: "Segoe UI", size: 14 },
          align: "start",
          padding: { bottom: 16 },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "#1e2330",
          borderColor: "#b8b5af",
          borderWidth: 1,
          titleColor: "#f5f5f7",
          bodyColor: "#f5f5f7",
          callbacks: {
            label: (ctx) => `Price: ${ctx.raw}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: "#414450" },
          ticks: {
            color: "#6b7280",
            font: { size: 11 },
            callback: function (val, index) {
              return index % 2 === 0 ? this.getLabelForValue(val) : "";
            },
          },
        },
        y: {
          grid: {
            color: "#414450",
            borderDash: [4, 8],
          },
          border: { color: "#414450" },
          ticks: { color: "#6b7280", font: { size: 11 } },
          afterDataLimits: (scale) => {
            scale.min = Math.floor((scale.min - 200) / 100) * 100;
            scale.max = Math.ceil((scale.max + 200) / 100) * 100;
          },
        },
      },
    },
  });
}

// fetching functions
const ONE_MINUTE = 1 * 60 * 1000;
function fetchcurrentPrice() {
  let symbol = "XAU";
  let currency = "USD";
  let currentPriceAPI = `https://api.gold-api.com/price/${symbol}/${currency}`;
  const lastFetched = localStorage.getItem("currentPriceLastFetched");
  const now = Date.now();

  if (lastFetched && now - parseInt(lastFetched) < ONE_MINUTE) {
    console.log(
      "Using cached current price: " +
        Date(localStorage.getItem("currentPrice")),
    );

    // show cached value on screen
    if (localStorage.getItem("currentPrice") != null) {
      const elapsed =
        Date.now() - parseInt(localStorage.getItem("currentPriceLastFetched"));
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);

      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      const timeAgo =
        seconds < 60
          ? rtf.format(-seconds, "second")
          : rtf.format(-minutes, "minute");
      let currentPriceCard = document.getElementById("currentPriceCard");
      currentPriceCard.style.color = "#cbb271";
      currentPriceCard.style.fontSize = "1.5rem";
      currentPriceCard.innerHTML =
        `${Number(localStorage.getItem("currentPrice")).toFixed(2)} <small> $ / oz (31.1g)</small>` +
        `<br><small>Last Updated ${timeAgo}</small>`;
    }
    if (localStorage.getItem("priceHistory") != null) {
      let priceHist = JSON.parse(localStorage.getItem("priceHistory"));
      let newPrice = priceHist[priceHist.length - 1]["max_price"];
      let prevPrice = priceHist[priceHist.length - 2]["max_price"];
      displayDiff(newPrice, prevPrice);
      fillPrices(calculatedPrices());
    }
    return;
  }

  // one minute has passed, fetch new current price
  fetch(currentPriceAPI)
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("currentPrice", JSON.stringify(data["price"]));
      localStorage.setItem(
        "currentPriceUpdatedAt",
        JSON.stringify(data["updatedAt"]),
      );
      localStorage.setItem("currentPriceLastFetched", Date.now());

      // show fresh value on screen after saving the new price with its history
      // if (localStorage.getItem("currentPrice") != null) {
      const elapsed =
        Date.now() - parseInt(localStorage.getItem("currentPriceLastFetched"));
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);

      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      const timeAgo =
        seconds < 60
          ? rtf.format(-seconds, "second")
          : rtf.format(-minutes, "minute");

      let currentPriceCard = document.getElementById("currentPriceCard");
      currentPriceCard.style.color = "#cbb271";
      currentPriceCard.style.fontSize = "1.5rem";
      currentPriceCard.innerHTML =
        `${Number(localStorage.getItem("currentPrice")).toFixed(2)}<small> $ / oz (31.1g)</small>` +
        `<br><small>Last Updated ${timeAgo}</small>`;
      // }
      if (localStorage.getItem("priceHistory") != null) {
        let priceHist = JSON.parse(localStorage.getItem("priceHistory"));
        let newPrice = priceHist[priceHist.length - 1]["max_price"];
        let prevPrice = priceHist[priceHist.length - 2]["max_price"];
        displayDiff(newPrice, prevPrice);
        fillPrices(calculatedPrices());
      }
    })
    .catch((err) => {
      console.error("Error while fetching current price: " + err);
    });
}

const TEN_MINUTES = 10 * 60 * 1000;
function fetchPriceHistory() {
  // Getting Price History
  let api_key =
    "2a0f00f979858ffb360e58ef8a32b285c055963a1a596a3210590e4fa72dbbd7";
  let groupBy = "day";
  let symbol = "XAU";
  const endTimestamp = Math.floor(Date.now() / 1000);
  const startTimestamp = endTimestamp - 20 * 24 * 60 * 60;
  let priceHistoryAPI = `https://api.gold-api.com/history?symbol=${symbol}&groupBy=${groupBy}&startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}`;
  const lastFetched = localStorage.getItem("priceHistoryLastFetched");
  const now = Date.now();

  // if ten minutes didnt pass yet, show the cached data
  if (lastFetched && now - parseInt(lastFetched) < TEN_MINUTES) {
    const cached = localStorage.getItem("priceHistory");
    console.log("Using cached price history");
    console.log(`Using the previously fetched data ${cached}`);

    renderChart(JSON.parse(cached));
    // if (localStorage.getItem("currentPrice")) {
    //   fillPrices(calculatedPrices());
    // }
    return;
  }

  fetch(priceHistoryAPI, {
    method: "GET",
    headers: {
      "x-api-key": `${api_key}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("priceHistory", JSON.stringify(data));
      localStorage.setItem("priceHistoryLastFetched", now.toString());
      console.log(
        `New data is just fetched ${localStorage.getItem("priceHistoryLastFetched")}`,
      );
      renderChart(data);
      // if (localStorage.getItem("currentPrice")) {
      //   fillPrices(calculatedPrices());
      // }
    })
    .catch((err) => {
      console.error(
        "Error while fetching price history - func fetchPriceHistory: " + err,
      );
    });
}

fetchcurrentPrice();
setInterval(fetchcurrentPrice, ONE_MINUTE);

fetchPriceHistory();
setInterval(fetchPriceHistory, TEN_MINUTES);

// modifying currency based on click
let pricecardmain = document.getElementById("pricecardmain");
pricecardmain.addEventListener("click", (event) => {
  let target = event.target;
  let result = calculatedPrices();
  let currentPriceCard = document.getElementById("currentPriceCard");
  let usCurrency = document.getElementById("usCurrency");
  let joCurrency = document.getElementById("joCurrency");

  if (target.name === "usCurrency") {
    usCurrency.classList.add("clicked");
    joCurrency.classList.remove("clicked");
    //changing current price
    const elapsed =
      Date.now() - parseInt(localStorage.getItem("currentPriceLastFetched"));
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const timeAgo =
      seconds < 60
        ? rtf.format(-seconds, "second")
        : rtf.format(-minutes, "minute");
    currentPriceCard.innerHTML =
      `${result["USD"].current} <small> / oz (31.1g)</small>` +
      `<br><small>Last Updated ${timeAgo}</small>`;

    // changing price difference
    let priceHist = result["USD"].priceHistory;
    let newPrice = priceHist[priceHist.length - 1]["max_price"];
    let prevPrice = priceHist[priceHist.length - 2]["max_price"];
    displayDiff(newPrice, prevPrice);

    // refilling the prices
    fillPrices(calculatedPrices(), (currency = "USD"));

    // recreating the chart
    renderChart(priceHist, "USD");
  } else if (target.name === "joCurrency") {
    joCurrency.classList.add("clicked");
    usCurrency.classList.remove("clicked");
    //changing current price
    const elapsed =
      Date.now() - parseInt(localStorage.getItem("currentPriceLastFetched"));
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const timeAgo =
      seconds < 60
        ? rtf.format(-seconds, "second")
        : rtf.format(-minutes, "minute");

    currentPriceCard.innerHTML =
      `${result["JOD"].current} <small> / oz (31.1g)</small>` +
      `<br><small>Last Updated ${timeAgo}</small>`;

    // changing price difference
    let priceHist = result["JOD"].priceHistory;
    let newPrice = priceHist[priceHist.length - 1]["max_price"];
    let prevPrice = priceHist[priceHist.length - 2]["max_price"];
    displayDiff(newPrice, prevPrice);

    // refilling the prices
    fillPrices(calculatedPrices(), (currency = "JOD"));

    // recreating the chart
    renderChart(priceHist, "JOD");
  }
});



 
 let news= document.getElementById("news");
  let savedNews = JSON.parse(localStorage.getItem("newsData")) || [];
  let lastFetchTim= parseInt(localStorage.getItem("newsTime")) || 0;
let  data =Date.now();

if(savedNews.length > 0 && lastFetchTim && data - lastFetchTim < 600000){
    displayNews(savedNews);
}


else{


   fetch ("https://newsdata.io/api/1/latest?apikey=pub_8cdfe34522554af9bab8604d4a8294f9&q=economy OR politics&language=en")
   
    .then(res => res.json())
        .then(data => {
let articles = data.results ? data.results.slice(0,10) : [];          
  localStorage.setItem("newsData", JSON.stringify(articles));
            localStorage.setItem("newsTime",date.now() );
 

            displayNews(articles);
        })
    .catch(() => {
        console.log("API Error");
   
   if(savedNews.length > 0){
        displayNews(savedNews);
    }
})
}
 function displayNews(articles){
    
    news.innerHTML = "";
    
      
 articles.forEach(element => {
    
      let div =document.createElement("div");
      div.classList.add("swiper-slide");
        div.innerHTML = `
        <div class="content">
            <h3> <label class="lable" > Latest News | </label> ${element.title}</h3>
        </div>
        `

  div.addEventListener("click", () => {
    window.open(element.link, "_blank");
  });

          news.appendChild(div);

 });
  
new Swiper(".swiper",{
    loop:false,
    freeMode: true,

   slidesPerView: "auto",
  spaceBetween: 50,
     speed: 800,

    autoplay: { 
        delay: 4000,
        disableOnInteraction: false,
    },

    pagination:({
        el:".swiper-pagination",
        clickable:true,
    })

,
navigation:{

nextEl:".swiper-button-next",
prevEl:".swiper-button-prev",

}



})
    
 }




// const the_animation = document.querySelectorAll(".animation");
// const observer = new IntersectionObserver(
//   (entries) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         entry.target.classList.add("scroll-animation");
//       } else {
//         entry.target.classList.remove("scroll-animation");
//       }
//     });
//   },
//   { threshold: 0.25 },
// );
// //
// for (let i = 0; i < the_animation.length; i++) {
//   const elements = the_animation[i];

//   observer.observe(elements);
// }

let authLink = document.getElementById("authLink");
let user = sessionStorage.getItem("currentUser");

if (user) {
  //  مسجل دخول
  authLink.innerText = "Logout";

  authLink.addEventListener("click", (e) => {
    e.preventDefault(); //  يمنع الانتقال
    sessionStorage.removeItem("currentUser");
    window.location.href = "../login.html";
  });
} else {
  // مش مسجل
  authLink.innerText = "Login";
  authLink.href = "../login.html"; //  هون عادي
}



