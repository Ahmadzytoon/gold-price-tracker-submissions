fetch('header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;

        // Active nav
        const path = window.location.pathname;
        document.querySelectorAll("#nav-bar nav ul li a").forEach(link => {
            link.classList.remove("active");
            const href = link.getAttribute("href");
            if (
                href === path ||
                (href === "/index.html" && (path === "/" || path === "/index.html"))
            ) {
                link.classList.add("active");
            }
        });

        // Show/hide buttons based on login state
        const loggedInUser = sessionStorage.getItem("loggedInUser");
        const loginBtn = document.getElementById("login-btn");
        const registerBtn = document.getElementById("Register-btn");
        const assetsbar=document.getElementById("asset-link");

       if (loggedInUser) {
       const user = JSON.parse(loggedInUser);
       assetsbar.innerHTML=`  <li><a id="asset-link" href="/assets.html">My Assets</a></li>`;

      loginBtn.style.display = "none";
       registerBtn.style.display = "none";

    const userInfo = document.createElement("div");
    userInfo.id = "user-info";
    userInfo.innerHTML = `
        <span id="user-name"><i class="fa-solid fa-user"></i> ${user.name || user.email}</span>
        <button id="logout-btn">Logout</button>
    `;

    document.getElementById("buttons").appendChild(userInfo);

    document.getElementById("logout-btn").addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "/index.html";
    });
}
    });


    //footer
fetch('footer.html')
    .then(response => response.text())
    .then(data => document.getElementById('footer-placeholder').innerHTML = data);
