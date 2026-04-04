# gold-price-tracker-submissions

# Gold Price Tracker Web App

## Team Members
- **Yousef Zuaiant**
- **Dana Alkhabbas**(product owner)
- **Ahmad Al Tamimi**(scrum manster)

##  Project Idea & Overview
This project is a comprehensive web application simulating a real-world gold tracking platform. Designed and built using HTML, CSS, and Vanilla JavaScript, the application allows users to view live gold market prices, read the latest financial news, and manage a personal digital vault of their gold assets. 

**Core Logic:** Overcoming the challenge of having only the live gold ounce price (XAU), the application dynamically calculates all other standards: Gram prices, 24K, 21K, 18K values, as well as calculated specific values for English Lira, Rashadi Lira, and standard Gold Bars. 

**Asset Vault:** Users can securely register, log in, and add their personal assets (indicating weight, karat, and original purchase price) to their vault. The system then automatically calculates their real-time **Profit and Loss (P&L)** percentages based on the live fetched market rates. All data is persisted entirely on the client side without relying on an external database.

## Technologies Used
- **Frontend Core:** HTML5, CSS3, Vanilla JavaScript (ES6).
- **Styling:** Custom Vanilla CSS, Flexbox, Responsive Data Layouts.
- **Data Storage:** Browser `LocalStorage` (for user and asset persistent data) & `SessionStorage` (for active authentication states).
- **APIs Used:** 
  - `gold-api.com` (Live XAU Gold Prices)
  - `gnews.io` (Gold-related Financial News Updates)
- **Data Formats:** JSON, Fetch API.

##  How to Run
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/AR92-Dev/gold-asset-tracker.git
   ```
2. Navigate into the directory.
3. Open `index.html` using a simple local server (Highly recommended: **Live Server** extension in VS Code).
4. Register a new account, log in, browse live prices, toggle currencies (USD ⇄ JOD), and manage your dynamic gold assets vault!

## Figma Link :https://www.figma.com/design/qnKpwVtPk96BMIf26I1ur4/GoldProject?node-id=0-1&t=5nu7pL8fxizoTCjd-1

## Project manegment tool we used github projects :https://github.com/users/AR92-Dev/projects/1
