import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { storage } from './db/storage.js';
import { calculateRecipeIngredientCosts, calculateProductionCost, calculateSellingPriceAndProfit } from './utils/calculations.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../../frontend/dist');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Serve static frontend UI when built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- INGREDIENTS API ---

// List ingredients
app.get('/api/ingredients', (req, res) => {
  try {
    const { category, search } = req.query;
    const ingredients = storage.getIngredients(category, search);
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single ingredient
app.get('/api/ingredients/:id', (req, res) => {
  try {
    const item = storage.getIngredientById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Ingredient not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create ingredient
app.post('/api/ingredients', (req, res) => {
  try {
    const { name, purchaseQuantity, purchasePrice } = req.body;
    if (!name || !purchaseQuantity || purchasePrice === undefined) {
      return res.status(400).json({ error: 'Name, purchase quantity, and purchase price are required' });
    }
    const newIng = storage.createIngredient(req.body);
    res.status(201).json(newIng);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update ingredient
app.put('/api/ingredients/:id', (req, res) => {
  try {
    const updated = storage.updateIngredient(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Ingredient not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete ingredient
app.delete('/api/ingredients/:id', (req, res) => {
  try {
    const ok = storage.deleteIngredient(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Ingredient not found' });
    res.json({ success: true, message: 'Ingredient deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Price history
app.get('/api/price-history', (req, res) => {
  try {
    const history = storage.getPriceHistory(req.query.ingredientId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RECIPES API ---

// List recipes
app.get('/api/recipes', (req, res) => {
  try {
    const { category, search } = req.query;
    const recipes = storage.getRecipes(category, search);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single recipe
app.get('/api/recipes/:id', (req, res) => {
  try {
    const recipe = storage.getRecipeById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create recipe
app.post('/api/recipes', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Recipe name is required' });
    const created = storage.createRecipe(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update recipe
app.put('/api/recipes/:id', (req, res) => {
  try {
    const updated = storage.updateRecipe(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Recipe not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Duplicate recipe
app.post('/api/recipes/:id/duplicate', (req, res) => {
  try {
    const duplicated = storage.duplicateRecipe(req.params.id, req.body.newName);
    if (!duplicated) return res.status(404).json({ error: 'Original recipe not found' });
    res.status(201).json(duplicated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete recipe
app.delete('/api/recipes/:id', (req, res) => {
  try {
    const ok = storage.deleteRecipe(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- DASHBOARD API ---
app.get('/api/dashboard', (req, res) => {
  try {
    const stats = storage.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- STANDALONE SIMULATOR / CALCULATOR ---
app.post('/api/calculate', (req, res) => {
  try {
    const {
      items = [],
      packagingCost = 0,
      labourCost = 0,
      utilitiesCost = 0,
      transportCost = 0,
      otherExpenses = 0,
      wastagePercentage = 0,
      wastageBasis = 'ingredients',
      yieldCount = 1,
      pricingStrategy = 'margin',
      targetPercentage = 30
    } = req.body;

    const ingCalc = calculateRecipeIngredientCosts(items);
    const prodCalc = calculateProductionCost({
      ingredientCost: ingCalc.totalIngredientCost,
      packagingCost,
      labourCost,
      utilitiesCost,
      transportCost,
      otherExpenses,
      wastagePercentage,
      wastageBasis,
      yieldCount
    });
    const profitCalc = calculateSellingPriceAndProfit({
      costPerProduct: prodCalc.costPerProduct,
      yieldCount: prodCalc.yieldCount,
      pricingStrategy,
      targetPercentage
    });

    res.json({
      ingredients: ingCalc,
      productionCost: prodCalc,
      profitAnalysis: profitCalc
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// SPA fallback: any non-API route serves index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'BakeCost Pro Backend is running. Run "npm run build" in frontend to serve the UI.' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Bakery Cost Calculator Backend running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`To free up port ${PORT}, run:\n  lsof -ti :${PORT} | xargs kill -9\n`);
  } else {
    console.error('Server error:', err);
  }
});
