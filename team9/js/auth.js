function generateUserId() {
  return 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

function register(name, phone, email, password, gender) {
  let users = getUsers();
  let exists = users.find(function(u) { return u.email === email; });

  if (exists) {
    return { success: false, message: "Email already registered." };
  } else {
    let newUser = { id: generateUserId(), name, phone, email, password, gender };
    users.push(newUser);
    saveUsers(users);
    return { success: true };
  }
}

function login(email, password) {
  let users = getUsers();
  let idx = users.findIndex(function(u) {
    return u.email === email && u.password === password;
  });

  if (idx === -1) {
    return { success: false, message: "Wrong email or password." };
  } else {
    // Migrate: assign ID to legacy users who don't have one yet
    if (!users[idx].id) {
      users[idx].id = generateUserId();
      saveUsers(users);
    }
    saveCurrentUser(users[idx]);
    return { success: true };
  }
}

function logout() {
  clearCurrentUser();
  window.location.href = "login.html";
}

function requireAuth() {
  let user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  }
}
