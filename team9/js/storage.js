function getUsers() {
  return JSON.parse(localStorage.getItem("gpt_users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("gpt_users", JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem("gpt_current_user"));
}

function saveCurrentUser(user) {
  sessionStorage.setItem("gpt_current_user", JSON.stringify(user));
}

function clearCurrentUser() {
  sessionStorage.removeItem("gpt_current_user");
}

function getUserAssetsKey(userId) {
  return 'gpt_assets_' + userId;
}

function getAssets(userId) {
  if (!userId) {
    let user = getCurrentUser();
    userId = user ? user.id : null;
  }
  if (!userId) return [];
  return JSON.parse(localStorage.getItem(getUserAssetsKey(userId))) || [];
}

function saveAssets(assets, userId) {
  if (!userId) {
    let user = getCurrentUser();
    userId = user ? user.id : null;
  }
  if (!userId) return;
  localStorage.setItem(getUserAssetsKey(userId), JSON.stringify(assets));
}

function getPriceHistory() {
  return JSON.parse(localStorage.getItem("gpt_price_history")) || [];
}

function savePriceHistory(history) {
  localStorage.setItem("gpt_price_history", JSON.stringify(history));
}

function addPriceSnapshot(price) {
  let history = getPriceHistory();
  history.push({
    date: new Date().toLocaleDateString(),
    price: price
  });
  if (history.length > 30) {
    history = history.slice(history.length - 30);
  }
  savePriceHistory(history);
}
