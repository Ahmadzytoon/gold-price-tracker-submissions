   //get html element
      let form = document.getElementById("form");
      let inputEmail = document.getElementById("regEmail");
      let inputPassword = document.getElementById("regPassword");
      let emailError = document.getElementById("emailError");
      let passwordError = document.getElementById("passwordError");

      function validateUser() {
        emailError.textContent = "";
        passwordError.textContent = "";

        let users = JSON.parse(localStorage.getItem("users")) || [];
        let emailValue = inputEmail.value.trim();
        let passValue = inputPassword.value;
        let valid = true;
        if (emailValue === "") {
          emailError.textContent = "Email is required";
          valid = false;
        }
        if (passValue === "") {
          passwordError.textContent = "Password is required";
          valid = false;
        }
        if (!valid) {
          return;
        }
        let userFound = users.find(
          (x) => x.email === emailValue && x.password === passValue,
        );
        if (!userFound) {
          passwordError.textContent = "Invalid username or Password";
        } else {
          Swal.fire({
            title: "Welcome Back!",
            text: `Hello, ${userFound.name}!`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
              window.location.href = "/index.html";
            },
          });
          sessionStorage.setItem("isActive", true);
          sessionStorage.setItem("userId",userFound.id);
        }
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        validateUser();
        form.reset();
      });