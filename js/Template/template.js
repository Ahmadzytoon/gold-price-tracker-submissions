fetchdata();

function fetchdata() {
    fetch('/html/Template/header.html')
    .then(response => {
        if (!response.ok) throw new Error("Header not found!");
        return response.text();
    })
    .then(data => {

        document.getElementById('header-placeholder').innerHTML = data;
        
        const showDiv = document.getElementById("show");
        const logout = document.getElementById("logout"); 
        const showDiv_resp = document.getElementById("login_resp");
        const logout_resp = document.getElementById("logout_resp");
        
        if (showDiv && logout) {
            if (localStorage.getItem("isLoggedIn") === "true") {
                showDiv.style.display = "none"; 
                showDiv_resp.style.display = "none"; 
                logout.style.display = "block";
                logout_resp.style.display = "block";
            } else {
                showDiv.style.display = "flex"; 
                logout.style.display = "none";
                showDiv_resp.style.display = "flex"; 
                logout_resp.style.display = "none";
            }
            logout.addEventListener("click", () => {
                localStorage.setItem("isLoggedIn", "false");
                localStorage.setItem("currentUser", "");
                fetchdata(); 
            });
            logout_resp.addEventListener("click", () => {
                localStorage.setItem("isLoggedIn", "false");
                localStorage.setItem("currentUser", "");
                fetchdata(); 
            });
        }
    })
    .catch(error => console.error(error));

    fetch('/html/Template/footer.html')
    .then(response => {
        if (!response.ok) throw new Error("Footer not found!");
        return response.text();
    })
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error(error));
}

function show_side(){
    const side=  document.getElementById("side")
   side.style.display="flex"
   document.getElementById("menu").style.display="none"
}
function close_side(){
    const side=  document.getElementById("side")
   side.style.display="none"
   document.getElementById("menu").style.display="block"
}