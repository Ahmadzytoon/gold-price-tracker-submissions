const API_KEY = "dc479b4eb3c06703250e492100d2f0f2cb52f11e36f7f52a51d303048e9c1a6e";
const LIVE_API_URL = 'https://api.gold-api.com/price/XAU'; 
const HISTORY_API_URL = 'https://api.gold-api.com/history';
const CACHE_TIME_LIMIT = 10 * 60 * 1000; 
const HISTORY_CACHE_LIMIT = 60 * 60 * 1000; 

let peroid = "month";
const dayBtn = document.getElementById("day");
const monthBtn = document.getElementById("month");
// const yearBtn = document.getElementById("year");
const ctx = document.getElementById('myChart');

const myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      fill: true,
      tension: 0.4, 
      backgroundColor: "#d4af3722",
      borderColor: "#D4AF37",
      data: [],
      pointRadius: 0,
      pointHoverRadius: 0,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: {} }
  }
});

async function fetchTodayLive() {
    const lastFetchTime = localStorage.getItem("last_fetch_time");
    const now = Date.now();

    if (lastFetchTime && (now - lastFetchTime < CACHE_TIME_LIMIT)) {
        if(peroid === "month") updateChartDisplay();
        return;
    }

    try {
        const response = await fetch(LIVE_API_URL, {
            headers: { 'x-api-key': API_KEY } 
        });
        if (!response.ok) throw new Error("Error fetching live data");
        const data = await response.json();
        
        const dateObj = new Date(data.updatedAt);
        
        const newRecord = {
            hours: dateObj.getHours().toString().padStart(2, '0'),
            minuts: dateObj.getMinutes().toString().padStart(2, '0'),
            price: data.price
        };

        let savedData = JSON.parse(localStorage.getItem("today_dates")) || [];
        savedData.push(newRecord);
        localStorage.setItem("today_dates", JSON.stringify(savedData));
        localStorage.setItem("last_fetch_time", now);

        if(peroid === "day") updateChartDisplay();
    } catch (error) {
        console.error(error);
        if(peroid === "day") updateChartDisplay();
    }
}

async function fetchHistory(timeframe) {
    const cachedHistory = JSON.parse(localStorage.getItem(`history_${timeframe}`));
    const now = Date.now();

    if (cachedHistory && (now - cachedHistory.timestamp < HISTORY_CACHE_LIMIT)) {
        renderHistoryChart(cachedHistory.data, timeframe);
        return;
    }

    const endTimestamp = Math.floor(now / 1000); 
    let startTimestamp, groupBy;

    if (timeframe === "month") {
        startTimestamp = endTimestamp - (30 * 24 * 60 * 60); 
        groupBy = "day"; 
    } else if (timeframe === "year") {
        startTimestamp = endTimestamp - (365 * 24 * 60 * 60); 
        groupBy = "month"; 
    }

    const url = `${HISTORY_API_URL}?symbol=XAU&startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}&groupBy=${groupBy}&aggregation=avg&orderBy=asc`;
    
    try {
        const response = await fetch(url, {
            headers: { 'x-api-key': API_KEY }
        });
        if (!response.ok) throw new Error("Error fetching history");
        
        const data = await response.json(); 
        console.log("the data is adassadasdasdasad:"+data)
        localStorage.setItem(`history_${timeframe}`, JSON.stringify({
            timestamp: now,
            data: data
        }));

        renderHistoryChart(data, timeframe);
    } catch (error) {
        console.error(error);
        if (cachedHistory) renderHistoryChart(cachedHistory.data, timeframe);
    }
}

function updateChartDisplay() {
  const chartdata = JSON.parse(localStorage.getItem("today_dates")) || []; 
  if (chartdata.length === 0) return;

  const xValue = chartdata.map(item => `${item.hours}:${item.minuts}`);
  const yValues = chartdata.map(item => item.price);
  
  myChart.data.labels = xValue;
  myChart.data.datasets[0].data = yValues;
  myChart.update();
}


function renderHistoryChart(data, timeframe) {
    let xValue = [];
    let yValues = [];

    const records = Array.isArray(data) ? data : data.array || data.data || [];

    xValue = records.map(item => {
        if (timeframe === "month") {
            const d = new Date(item.day || item.date);
            return `${d.getMonth() + 1}/${d.getDate()}`; 
            
        } else if (timeframe === "year") {
            if (item.month !== undefined && item.year !== undefined) {
                return `${item.month}/${item.year}`;
            } else {
                const d = new Date(item.month || item.day || item.date);
                return `${d.getMonth() + 1}/${d.getFullYear()}`;
            }
        }
    });
  
    yValues = records.map(item => parseFloat(item.avg_price || item.price));

    myChart.data.labels = xValue;
    myChart.data.datasets[0].data = yValues;
    myChart.update();
}

dayBtn.addEventListener("click", () => {
    peroid = "day";
    dayBtn.className = "selected";
    monthBtn.className = "";
    // yearBtn.className = "";
    updateChartDisplay(); 
});

monthBtn.addEventListener("click", () => {
    peroid = "month";
    monthBtn.className = "selected";
    dayBtn.className = "";
    // yearBtn.className = "";
    fetchHistory("month"); 
});

// yearBtn.addEventListener("click", () => {
//     peroid = "year";
//     yearBtn.className = "selected";
//     dayBtn.className = "";
//     monthBtn.className = "";
//     fetchHistory("year"); 
// });

fetchTodayLive(); 
setInterval(fetchTodayLive, CACHE_TIME_LIMIT);