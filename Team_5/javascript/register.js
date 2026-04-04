//get html element
      let form = document.getElementById("form");
      let inputName = document.getElementById("regName");
      let inputEmail = document.getElementById("regEmail");
      let inputPhone = document.getElementById("regPhone");
      let inputGender = document.getElementById("regGender");
      let inputPassword = document.getElementById("regPassword");
      let inputConfirmPassword = document.getElementById("regConfirm");
      let nameError = document.getElementById("nameError");
      let emailError = document.getElementById("emailError");
      let passwordError = document.getElementById("passwordError");
      let confirmPasswordError = document.getElementById("ConfirmError");
      let phoneError = document.getElementById("phoneError");
      let genderError = document.getElementById("genderError");
      function checkValidation() {
        nameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";
        passwordError.textContent = "";
        phoneError.textContent = "";
        genderError.textContent = "";
        let users = JSON.parse(localStorage.getItem("users")) || [];

        let valid = true;

        const nameRegex = /^[a-zA-Z\s]+$/;
        if (inputName.value.trim() === "") {
          nameError.textContent = "Full name is required";
          valid = false;
        } else if (!nameRegex.test(inputName.value)) {
          nameError.textContent = "Letters Only";
          valid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (inputEmail.value.trim() === "") {
          emailError.textContent = "Email is required";
          valid = false;
        } else if (!emailPattern.test(inputEmail.value)) {
          emailError.textContent = "Not Valid Email";
          valid = false;
        } else {
          let existEmail = users.find(
            (x) => x.email === inputEmail.value.trim(),
          );

          if (existEmail) {
            emailError.textContent = "Email is already exsits";
            valid = false;
          }
        }
        const phonePattern = /^((\+962)|0)7[789]\d{7}$/;
        if (inputPhone.value.trim() == "") {
          phoneError.textContent = "Phone is required";
          valid = false;
        } else if (!phonePattern.test(inputPhone.value)) {
          phoneError.textContent =
            "Invalid Jordanian number (e.g., 0791234567)";
          valid = false;
        }
        if (inputPassword.value.trim() === "") {
          passwordError.textContent = "Password is requierd";
          valid = false;
        } else if (
          inputPassword.value.trim().length < 8 ||
          inputPassword.value.trim().length > 32
        ) {
          passwordError.textContent =
            "Length must be between 8 and 32 characters.";
          valid = false;
        } else if (!inputPassword.value.match(/^[A-Z]/)) {
          passwordError.textContent = "Must start with a capital letter.";
          valid = false;
        } else if ((inputPassword.value.match(/\d/g) || []).length < 2) {
          passwordError.textContent = "Must contain at least 2 numbers.";
          valid = false;
        } else if (!inputPassword.value.match(/[^a-z0-9]/i)) {
          passwordError.textContent =
            "Must contain at least 1 special character.";
          valid = false;
        }
        if (inputPassword.value !== inputConfirmPassword.value) {
          confirmPasswordError.textContent = "Passwords do not match";
          valid = false;
        }
        if (inputGender.value == "") {
          genderError.textContent = "Gender is required";
          valid = false;
        }
        if (valid) {
          let newId = users.length + 1;
          let user = {
            id: newId,
            name: inputName.value,
            email: inputEmail.value,
            phone: inputPhone.value,
            password: inputPassword.value,
            gender: inputGender.value,
          };

          users.push(user);

          localStorage.setItem("users", JSON.stringify(users));

          Swal.fire({
            title: "Success!",
            text: "Account created! Go to login...",
            icon: "success",
            timer: 2000, //
            showConfirmButton: false,
            willClose: () => {
              window.location.href = "login.html";
            },
          });
        }
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        checkValidation();
      });