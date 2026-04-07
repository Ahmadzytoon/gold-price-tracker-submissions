function loadProfileData() {
  requireAuth();

  let user = getCurrentUser();
  if (user) {
    document.getElementById("prof-name").value = user.name;
    document.getElementById("prof-phone").value = user.phone;
    document.getElementById("prof-email").value = user.email;
    document.getElementById("prof-gender").value = user.gender || "male";

    // Display user ID if element exists
    let idEl = document.getElementById("prof-user-id");
    if (idEl) idEl.textContent = user.id || "Legacy Account (login again to assign ID)";
  }
}

function handleSaveProfile() {
  let name = document.getElementById("prof-name").value.trim();
  let phone = document.getElementById("prof-phone").value.trim();
  let oldPassword = document.getElementById("prof-old-password").value.trim();
  let password = document.getElementById("prof-password").value.trim();
  let gender = document.getElementById("prof-gender").value;
  let err = document.getElementById("prof-error");
  let success = document.getElementById("prof-success");
  err.style.display = "none";
  success.style.display = "none";

  let nameRegex = /^[a-zA-Z\s]{2,50}$/;
  let phoneRegex = /^07\d{8}$/;
  let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

  if (!name || !phone || !gender) {
    err.textContent = "Please fill in all required fields.";
    err.style.display = "block";
  } else if (!nameRegex.test(name)) {
    err.textContent = "Name must contain only letters and space (2-50 chars).";
    err.style.display = "block";
  } else if (!phoneRegex.test(phone)) {
    err.textContent = "Phone number must be exactly 10 digits and start with 07.";
    err.style.display = "block";
  } else {
    let user = getCurrentUser();
    let ok = true;

    if (password) {
      if (!oldPassword) {
        err.textContent = "Please enter your old password to set a new one.";
        err.style.display = "block";
        ok = false;
      } else if (oldPassword !== user.password) {
        err.textContent = "Incorrect old password! Cannot change password.";
        err.style.display = "block";
        ok = false;
      } else if (!passwordRegex.test(password)) {
        err.textContent = "New password must be min 8 chars, with at least one letter and one number.";
        err.style.display = "block";
        ok = false;
      }
    }

    if (ok) {
      let users = getUsers();
      let idx = users.findIndex(function(u) { return u.email === user.email; });
      if (idx !== -1) {
        users[idx].name = name;
        users[idx].phone = phone;
        users[idx].gender = gender;
        if (password) {
          users[idx].password = password;
        }
        // Preserve the unique ID — never overwrite it
        if (!users[idx].id && user.id) {
          users[idx].id = user.id;
        }
        saveUsers(users);
        user.name = name;
        user.phone = phone;
        user.gender = gender;
        if (password) {
          user.password = password;
        }
        document.getElementById("prof-password").value = "";
        saveCurrentUser(user);
        success.textContent = "Profile successfully updated!";
        success.style.display = "block";
        let nameEl = document.getElementById("nav-username");
        if (nameEl) { nameEl.textContent = "Hi, " + name; }
      } else {
        err.textContent = "Fatal error: Could not save data.";
        err.style.display = "block";
      }
    }
  }
}

function updateNavbar() {
  let user = getCurrentUser();
  let login = document.getElementById("nav-login");
  let logoutBtn = document.getElementById("nav-logout");
  let uname = document.getElementById("nav-username");

  if (user) {
    if (login) login.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (uname) {
      uname.style.display = "inline-flex";
      uname.style.alignItems = "center";
      uname.style.gap = "8px";
      uname.style.background = "rgba(201, 138, 106, 0.1)";
      uname.style.padding = "6px 14px";
      uname.style.borderRadius = "20px";
      uname.style.border = "1px solid rgba(201, 138, 106, 0.2)";
      uname.style.transition = "all 0.3s ease";

      uname.innerHTML = `<span class="fw-medium text-white" style="letter-spacing: 0.5px; font-size: 13px;">${user.name}</span>`;

      uname.onmouseover = function() {
        this.style.background = "rgba(201, 138, 106, 0.2)";
        this.style.borderColor = "var(--gold)";
      };
      uname.onmouseout = function() {
        this.style.background = "rgba(201, 138, 106, 0.1)";
        this.style.borderColor = "rgba(201, 138, 106, 0.2)";
      };
    }
  }
}

window.onload = function() {
  updateNavbar();
  loadProfileData();

  document.getElementById("prof-save-btn").addEventListener("click", handleSaveProfile);
  document.getElementById("nav-logout").addEventListener("click", logout);

  let cb = document.getElementById("show-prof-password");
  if (cb) {
    cb.addEventListener("change", function() {
      let pass = document.getElementById("prof-password");
      if (this.checked) {
        pass.type = "text";
      } else {
        pass.type = "password";
      }
    });
  }
};
