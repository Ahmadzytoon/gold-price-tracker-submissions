function isLogin(){
        let isActive = sessionStorage.getItem("isActive");
        if(isActive==="true"){
          console.log("Active");
          return true;
        }else{
         
          console.log("not Active");
          return false;
        }
      }
          function logOut(){
       sessionStorage.clear();
     
    Swal.fire({
        title: "Logged Out",
        text: "See you soon! 👋",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        window.location.href = "index.html";
    });
      }