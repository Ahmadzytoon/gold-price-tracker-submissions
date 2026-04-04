 let url = "https://gnews.io/api/v4/search?q=XAU&apikey=27cce719ffb889b71fa73a0217674462";
 let lodaingDiv = document.getElementById("loading");


const newsContainer = document.getElementById("news-container");

async function getGoldNews() {
    let cashed = JSON.parse(localStorage.getItem("goldNews"));
    let twoHours = 2 * 60 * 60 * 1000;
    if(cashed && (Math.abs(Date.now() - cashed.time) < twoHours)){
        console.log("Using Cache");
        return cashed.data;
    }
    let response = await fetch(url);
    let data = await response.json();
    console.log("Fetching from API");
    localStorage.setItem("goldNews",JSON.stringify({
        data:data,
        time:Date.now()
    }));
    return data;
}
lodaingDiv.innerHTML = `
    <div class="d-flex justify-content-center w-100">
        <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;
function displayNews(array){
    newsContainer.innerHTML="";
    lodaingDiv.textContent=""
    array.forEach(news=>{
        let col = document.createElement("div");
        col.classList.add("col-12", "col-md-6", "col-lg-4", "mb-4",);
        col.innerHTML =` <div class="news-card">
         <img src="${news.image }" alt="news image"> 
         <div class="news-card-body"> 
         <h5 class="news-card-title">${news.title}</h5> 
         <p class="news-card-desc">${news.description ? news.description.slice(0, 100) : "No description available"}......</p>
          <a href="${news.url}" target="_blank" class="btn btn-warning btn-sm mt-2">Read More</a> </div>
           </div>` ;
           newsContainer.appendChild(col);
    })
}
window.addEventListener("DOMContentLoaded", async () => {
     let news = await getGoldNews(); 
     displayNews(news.articles || news)});