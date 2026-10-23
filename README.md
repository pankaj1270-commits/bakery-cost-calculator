# BakeCost Pro — Bakery Product Cost & Profit Calculator Software

A modern, professional web application built for bakery owners to calculate the exact formulation costs, production overheads, and profitable selling prices for products like biscuits, cookies, cakes, breads, and pastries.

---

## 🌟 Key Features

1. **Exact Recipe Ingredient Costing**:
   - Calculates the cost of every ingredient used based on purchase rate.
   - Automatic unit conversions (kilograms to grams, litres to millilitres, dozens to pieces).
   - Dynamic real-time calculation as quantities or purchase prices change without page refresh.

2. **Verified Sample Biscuit Recipe Benchmark**:
   - **Butter**: 600g @ ₹700 per kg → **₹420.00**
   - **Baking Soda**: 1.7g @ ₹30 per 100g → **₹0.51**
   - **Maida (Flour)**: 800g @ ₹30 per 100g → **₹240.00**
   - **Total Ingredient Cost**: **₹660.51** *(Verified with automated tests)*

3. **Production Overhead & Wastage Buffer**:
   - Accounts for Packaging, Labour, Utilities (Electricity & Gas), Transportation, and Miscellaneous expenses.
   - Configurable Wastage calculation applied on raw ingredients (prevents double counting overheads).
   - Formula:
     $$\text{Total Production Cost} = \text{Ingredients} + \text{Packaging} + \text{Labour} + \text{Utilities} + \text{Transport} + \text{Misc} + \text{Wastage Cost}$$

4. **Selling Price & Margin vs Markup Calculator**:
   - Distinguishes **Profit Margin** from **Cost Markup** with clear educational formulas:
     - **Profit Margin**: $\text{Selling Price} = \frac{\text{Cost}}{1 - \text{Margin\%}}$
     - **Cost Markup**: $\text{Selling Price} = \text{Cost} \times (1 + \text{Markup\%})$
   - *Example verified*: ₹5 cost with 30% margin $\to \frac{5}{1 - 0.30} = \text{₹7.14}$.

5. **Ingredient Master & Price Audit Trail**:
   - Add, edit, and delete ingredients with procurement package sizing.
   - Historical price tracking with date, previous price, and reason for revision.
   - Recipe costs can be calculated using either **live market prices** or **saved historical snapshot prices**.

6. **Interactive Dashboard & Reports**:
   - Executive dashboard with Recharts visual charts comparing Unit Cost vs Suggested Selling Price.
   - Batch Production Simulator (plan daily bake runs and forecast pantry ingredient demand).
   - Professional PDF Export (formatted Bakery Costing Sheet).
   - Excel Workbook Export (.xlsx) for Recipe Costing and Ingredients Master.

7. **100% Free Firebase Deployment**:
   - Built with dependencies that can be deployed completely free on the **Firebase Spark Plan** (zero credit card required).
   - Works immediately offline in the browser with LocalStorage/IndexedDB fallback.
   - Optional Cloud Firestore sync via Settings UI.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Run the Frontend (Quick Start)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The application is immediately functional with pre-seeded bakery recipes and offline persistence!

### 2. Run the Node.js Express Backend (Optional)
```bash
cd backend
npm install
npm start
```
The backend API starts at [http://localhost:5050](http://localhost:5050).

### 3. Run Automated Tests
```bash
npm run test
```
Runs test suite validating:
- Exact sample biscuit recipe calculation: **₹660.51**
- Weight and volume unit conversions
- Selling price margin calculations (₹5 @ 30% margin = ₹7.14)
- Production cost and wastage formulas without double-counting

---

## ☁️ Deploy to Firebase for Free (Spark Plan)

Firebase Hosting provides **10 GB of storage, 360 MB/day transfer, and custom domain SSL completely free forever with no credit card required**.

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize & Deploy Frontend
```bash
cd frontend
# Build the production bundle
npm run build

# Deploy to Firebase Hosting for free
firebase deploy --only hosting
```

Your bakery application is now live on a global Google CDN URL (e.g. `https://your-bakery-app.web.app`)!

---

## 📐 Mathematical Formulation Guide

### 1. Ingredient Base Rate
$$\text{Cost per base unit} = \frac{\text{Purchase Price}}{\text{Purchase Quantity in Base Units}}$$
- 1 kg of Butter at ₹700 $\to \frac{700}{1000\text{ g}} = \text{₹0.70 per gram}$
- 100 g of Baking Soda at ₹30 $\to \frac{30}{100\text{ g}} = \text{₹0.30 per gram}$

### 2. Recipe Ingredient Cost
$$\text{Item Cost} = \text{Recipe Quantity in Base Units} \times \text{Cost per Base Unit}$$

### 3. Total Production Cost
$$\text{Production Cost} = \text{Ingredient Cost} + \text{Packaging} + \text{Labour} + \text{Utilities} + \text{Transport} + \text{Misc} + (\text{Ingredient Cost} \times \text{Wastage\%})$$

### 4. Cost Per Product
$$\text{Cost Per Product} = \frac{\text{Total Production Cost}}{\text{Batch Yield Count}}$$

### 5. Suggested Selling Price (Profit Margin Mode)
$$\text{Selling Price} = \frac{\text{Cost Per Product}}{1 - (\text{Margin\%} / 100)}$$
- Unit Profit = $\text{Selling Price} - \text{Cost Per Product}$
- Total Batch Profit = $\text{Unit Profit} \times \text{Batch Yield}$

---

## 🛠️ Tech Stack
- **Frontend**: React.js 18, Vite, Tailwind CSS, Lucide React, Recharts
- **PDF & Excel**: `jspdf`, `jspdf-autotable`, `xlsx` (SheetJS)
- **Backend**: Node.js, Express.js
- **Database / Storage**: Dual-layer architecture (IndexedDB / LocalStorage + Firebase Firestore + REST API)
- **Deployment**: Firebase Hosting (100% Free Spark Plan)
