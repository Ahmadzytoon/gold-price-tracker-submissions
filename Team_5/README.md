# Gold Track - Team 5

> A real-time gold price tracker and personal gold asset manager built with vanilla JavaScript, HTML, and CSS.

---


Saeed Albattah	Product Owner
Laila Harb	    Scrum Master
Yasmeen Saleh	Programmer
https://www.notion.so/3348a852382780eab003ea2f5cfd6551?v=3348a8523827800797a7000c5e622758&source=copy_link

## 📌 Overview

**Gold Track** is a web application that displays live gold prices across multiple karats and currencies, allows users to manage their personal gold assets, and shows the latest gold-related news — all in one place.

---

## ✨ Features

- **Live Gold Prices** — Real-time prices for XAU/USD ounce, 24K, 21K, 18K per gram, Rashadi Coin, and English Coin, refreshed every 5 seconds.
- **Price Change Indicators** — Up/down arrows with percentage change shown on every price card and the scrolling ticker bar.
- **Currency Toggle** — Switch between USD and JOD (Jordanian Dinar) with a single click.
- **Interactive Chart** — Live line chart showing gold price history over the current session using Chart.js.
- **My Assets** — Add, view, and delete personal gold holdings (jewellery, bars, or coins).
- **Profit & Loss Calculator** — Automatically calculates current value and profit/loss for each asset based on live gold prices.
- **Gold News** — Fetches and displays the latest gold-related news articles (cached for 2 hours to save API calls).
- **User Authentication** — Register and login system with full form validation (stored in localStorage).
- **Responsive Design** — Works across desktop and mobile screens using Bootstrap 5.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 + Bootstrap 5 | Styling and responsive layout |
| Vanilla JavaScript | All logic and DOM manipulation |
| Chart.js | Live gold price chart |
| SweetAlert2 | Beautiful alert dialogs |
| Font Awesome | Icons |
| [gold-api.com](https://gold-api.com) | Live gold price data |
| [exchangerate-api.com](https://exchangerate-api.com) | USD → JOD currency conversion |
| [GNews API](https://gnews.io) | Gold news articles |
| localStorage / sessionStorage | User data and asset persistence |

---

## 📁 Project Structure

```
Gold_Tracker-main/
│
├── index.html              # Main homepage
├── main.js                 # Core logic: prices, chart, currency toggle
├── main.css                # Global styles
├── style.css               # Additional styles
│
├── pages/
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   └── assets.html         # My Assets page
│
├── javascript/
│   ├── auth.js             # isLogin() and logOut() helpers
│   ├── login.js            # Login form validation
│   ├── register.js         # Register form validation
│   ├── asset.js            # Asset management logic
│   └── news.js             # Gold news fetching and display
│
└── assets/
    ├── icons/              # App icons (.ico, .png)
    └── video/              # Background video (gold1.mp4)
```

---

## 🚀 Getting Started

No build tools or dependencies are required. Simply open the project in your browser.

### 1. Clone the repository

```bash
git clone https://github.com/lailaharb004-creator/Gold_Tracker.git
cd Gold_Tracker
```

### 2. Open in browser

Open `index.html` directly in your browser, or use a local server for the best experience:

```bash
# Using VS Code Live Server extension (recommended)
# Right-click index.html → "Open with Live Server"

# Or using Python
python -m http.server 5500
```

Then visit `http://localhost:5500` in your browser.

> ⚠️ **Note:** Some browser security policies may block API calls when opening HTML files directly from the file system (`file://`). Using a local server avoids this issue.

---

## 🧮 How Asset Calculations Work

When you add a gold asset, the app calculates:

| Value | Formula |
|---|---|
| **Purchase Value** | `weight (g) × price paid per gram` |
| **Current Price/gram** | `live 24K price × (karat / 24)` |
| **Current Value** | `weight (g) × current price per gram` |
| **Profit / Loss** | `current value − purchase value` |

---

## 🔐 Authentication

- Registration requires a valid email, a Jordanian phone number, and a strong password (8–32 chars, starts with a capital letter, at least 2 digits and 1 special character).
- User accounts and assets are stored in the browser's **localStorage**.
- Session state is tracked with **sessionStorage** and cleared on logout.

---

## 🌐 APIs Used

| API | Usage |
|---|---|
| `https://api.gold-api.com/price/XAU` | Live XAU/USD gold price |
| `https://api.exchangerate-api.com/v4/latest/USD` | USD to JOD exchange rate |
| `https://gnews.io/api/v4/search?q=XAU` | Latest gold news |

---

## 📸 Pages

| Page | Description |
|---|---|
| `/index.html` | Homepage with live prices, chart, and news |
| `/pages/login.html` | User login |
| `/pages/register.html` | New account registration |
| `/pages/assets.html` | Manage personal gold assets (login required) |

---
##Figma link :https://www.figma.com/design/Q66E8dwm2krf2j7zETYIXV/Untitled?node-id=0-1&t=k8vEum6lIcWbgAkC-1
## 📄 License

This project was built for educational purposes. Feel free to use and modify it.

---

*GoldTrack © 2026*
