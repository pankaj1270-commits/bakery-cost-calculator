import { INITIAL_INGREDIENTS, INITIAL_PRICE_HISTORY, INITIAL_RECIPES } from './mockData.js';
import { calculateBaseCost } from '../utils/unitConverter.js';
import { calculateRecipeIngredientCosts, calculateProductionCost, calculateSellingPriceAndProfit } from '../utils/calculations.js';

const STORAGE_KEYS = {
  INGREDIENTS: 'bakecost_ingredients_v1',
  PRICE_HISTORY: 'bakecost_price_history_v1',
  RECIPES: 'bakecost_recipes_v1',
  FIREBASE_CONFIG: 'bakecost_firebase_config_v1',
  SETTINGS: 'bakecost_settings_v1'
};

class LocalStorageService {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.INGREDIENTS)) {
      localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(INITIAL_INGREDIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(INITIAL_PRICE_HISTORY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECIPES)) {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(INITIAL_RECIPES));
    }
  }

  // --- INGREDIENTS ---
  getIngredients(category = null, search = '') {
    const raw = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    let list = raw ? JSON.parse(raw) : INITIAL_INGREDIENTS;

    if (category && category !== 'All') {
      list = list.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.supplierName && i.supplierName.toLowerCase().includes(q)) ||
        i.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getIngredientById(id) {
    const list = this.getIngredients();
    return list.find(i => i.id === id) || null;
  }

  createIngredient(payload) {
    const list = this.getIngredients();
    const { costPerBaseUnit, baseUnit } = calculateBaseCost(
      payload.purchaseQuantity,
      payload.purchaseUnit,
      payload.purchasePrice
    );

    const newIng = {
      id: 'ing-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: payload.name.trim(),
      category: (payload.category || 'General').trim(),
      purchaseQuantity: Number(payload.purchaseQuantity) || 1,
      purchaseUnit: payload.purchaseUnit || 'kg',
      purchasePrice: Number(payload.purchasePrice) || 0,
      costPerBaseUnit,
      baseUnit,
      supplierName: (payload.supplierName || '').trim(),
      lastPurchaseDate: payload.lastPurchaseDate || new Date().toISOString().split('T')[0],
      notes: (payload.notes || '').trim(),
      updatedAt: new Date().toISOString()
    };

    list.unshift(newIng);
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(list));

    // Add to price history
    this.addPriceHistory({
      ingredientId: newIng.id,
      ingredientName: newIng.name,
      purchaseQuantity: newIng.purchaseQuantity,
      purchaseUnit: newIng.purchaseUnit,
      purchasePrice: newIng.purchasePrice,
      costPerBaseUnit: newIng.costPerBaseUnit,
      effectiveDate: newIng.lastPurchaseDate,
      reason: 'Initial creation'
    });

    return newIng;
  }

  updateIngredient(id, payload) {
    const list = this.getIngredients();
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return null;

    const current = list[index];
    const { costPerBaseUnit, baseUnit } = calculateBaseCost(
      payload.purchaseQuantity ?? current.purchaseQuantity,
      payload.purchaseUnit ?? current.purchaseUnit,
      payload.purchasePrice ?? current.purchasePrice
    );

    const priceChanged = (Number(payload.purchasePrice) !== current.purchasePrice) ||
      (Number(payload.purchaseQuantity) !== current.purchaseQuantity) ||
      (payload.purchaseUnit !== current.purchaseUnit);

    const updated = {
      ...current,
      name: payload.name !== undefined ? payload.name.trim() : current.name,
      category: payload.category !== undefined ? payload.category.trim() : current.category,
      purchaseQuantity: payload.purchaseQuantity !== undefined ? Number(payload.purchaseQuantity) : current.purchaseQuantity,
      purchaseUnit: payload.purchaseUnit !== undefined ? payload.purchaseUnit : current.purchaseUnit,
      purchasePrice: payload.purchasePrice !== undefined ? Number(payload.purchasePrice) : current.purchasePrice,
      costPerBaseUnit,
      baseUnit,
      supplierName: payload.supplierName !== undefined ? payload.supplierName.trim() : current.supplierName,
      lastPurchaseDate: payload.lastPurchaseDate !== undefined ? payload.lastPurchaseDate : current.lastPurchaseDate,
      notes: payload.notes !== undefined ? payload.notes.trim() : current.notes,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(list));

    if (priceChanged) {
      this.addPriceHistory({
        ingredientId: updated.id,
        ingredientName: updated.name,
        purchaseQuantity: updated.purchaseQuantity,
        purchaseUnit: updated.purchaseUnit,
        purchasePrice: updated.purchasePrice,
        costPerBaseUnit: updated.costPerBaseUnit,
        effectiveDate: updated.lastPurchaseDate || new Date().toISOString().split('T')[0],
        reason: payload.priceChangeReason || 'Price update'
      });
    }

    return updated;
  }

  deleteIngredient(id) {
    const list = this.getIngredients();
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return false;

    // Check usage in recipes
    const recipes = this.getRawRecipes();
    const usedIn = recipes.filter(r => r.items && r.items.some(item => item.ingredientId === id));
    if (usedIn.length > 0) {
      const names = usedIn.map(r => r.name).join(', ');
      throw new Error(`Cannot delete: ingredient is currently used in ${usedIn.length} recipe(s): ${names}`);
    }

    list.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(list));
    return true;
  }

  // --- PRICE HISTORY ---
  getPriceHistory(ingredientId = null) {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY);
    const history = raw ? JSON.parse(raw) : INITIAL_PRICE_HISTORY;
    if (ingredientId) {
      return history.filter(ph => ph.ingredientId === ingredientId);
    }
    return history.slice(0, 50);
  }

  addPriceHistory(record) {
    const history = this.getPriceHistory();
    const entry = {
      id: 'ph-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      ...record
    };
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(history));
    return entry;
  }

  // --- RECIPES ---
  getRawRecipes() {
    const raw = localStorage.getItem(STORAGE_KEYS.RECIPES);
    return raw ? JSON.parse(raw) : INITIAL_RECIPES;
  }

  getRecipes(category = null, search = '') {
    let list = this.getRawRecipes();
    if (category && category !== 'All') {
      list = list.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }

    return list.map(recipe => this.calculateFullRecipeCost(recipe));
  }

  getRecipeById(id) {
    const rawList = this.getRawRecipes();
    const recipe = rawList.find(r => r.id === id);
    if (!recipe) return null;
    return this.calculateFullRecipeCost(recipe);
  }

  calculateFullRecipeCost(recipe) {
    const ingredients = this.getIngredients();
    const ingMap = new Map(ingredients.map(i => [i.id, i]));

    const computedItems = (recipe.items || []).map(item => {
      const liveIng = ingMap.get(item.ingredientId);

      let purchaseQuantity = item.snapshotPurchaseQty;
      let purchaseUnit = item.snapshotPurchaseUnit;
      let purchasePrice = item.snapshotPurchasePrice;

      if (!recipe.useHistoricalPricing && liveIng) {
        purchaseQuantity = liveIng.purchaseQuantity;
        purchaseUnit = liveIng.purchaseUnit;
        purchasePrice = liveIng.purchasePrice;
      }

      return {
        ...item,
        name: item.name || (liveIng ? liveIng.name : 'Unknown Ingredient'),
        purchaseQuantity: purchaseQuantity || 1,
        purchaseUnit: purchaseUnit || 'g',
        purchasePrice: purchasePrice || 0
      };
    });

    const ingCalc = calculateRecipeIngredientCosts(computedItems);
    const prodCalc = calculateProductionCost({
      ingredientCost: ingCalc.totalIngredientCost,
      packagingCost: recipe.packagingCost,
      labourCost: recipe.labourCost,
      utilitiesCost: recipe.utilitiesCost,
      transportCost: recipe.transportCost,
      otherExpenses: recipe.otherExpenses,
      wastagePercentage: recipe.wastagePercentage,
      wastageBasis: recipe.wastageBasis,
      yieldCount: recipe.yieldCount
    });

    const profitCalc = calculateSellingPriceAndProfit({
      costPerProduct: prodCalc.costPerProduct,
      yieldCount: prodCalc.yieldCount,
      pricingStrategy: recipe.pricingStrategy || 'margin',
      targetPercentage: recipe.targetPercentage || 30
    });

    return {
      ...recipe,
      computedItems: ingCalc.items,
      totalIngredientCost: ingCalc.totalIngredientCost,
      productionCost: prodCalc,
      profitAnalysis: profitCalc
    };
  }

  createRecipe(payload) {
    const rawList = this.getRawRecipes();
    const ingredients = this.getIngredients();
    const ingMap = new Map(ingredients.map(i => [i.id, i]));

    const items = (payload.items || []).map(item => {
      const ing = ingMap.get(item.ingredientId);
      return {
        ingredientId: item.ingredientId,
        name: item.name || (ing ? ing.name : ''),
        quantity: Number(item.quantity) || 0,
        unit: item.unit || 'g',
        snapshotPurchaseQty: ing ? ing.purchaseQuantity : 1,
        snapshotPurchaseUnit: ing ? ing.purchaseUnit : 'g',
        snapshotPurchasePrice: ing ? ing.purchasePrice : 0,
        snapshotCostPerBaseUnit: ing ? ing.costPerBaseUnit : 0
      };
    });

    const newRecipe = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: payload.name.trim(),
      category: (payload.category || 'Bakery').trim(),
      description: (payload.description || '').trim(),
      yieldCount: Number(payload.yieldCount) || 1,
      yieldUnit: (payload.yieldUnit || 'pieces').trim(),
      packagingCost: Number(payload.packagingCost) || 0,
      labourCost: Number(payload.labourCost) || 0,
      utilitiesCost: Number(payload.utilitiesCost) || 0,
      transportCost: Number(payload.transportCost) || 0,
      otherExpenses: Number(payload.otherExpenses) || 0,
      wastagePercentage: Number(payload.wastagePercentage) || 0,
      wastageBasis: payload.wastageBasis || 'ingredients',
      pricingStrategy: payload.pricingStrategy || 'margin',
      targetPercentage: Number(payload.targetPercentage) || 30,
      useHistoricalPricing: Boolean(payload.useHistoricalPricing),
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    rawList.unshift(newRecipe);
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(rawList));

    return this.calculateFullRecipeCost(newRecipe);
  }

  updateRecipe(id, payload) {
    const rawList = this.getRawRecipes();
    const index = rawList.findIndex(r => r.id === id);
    if (index === -1) return null;

    const current = rawList[index];
    const ingredients = this.getIngredients();
    const ingMap = new Map(ingredients.map(i => [i.id, i]));

    let items = current.items;
    if (payload.items) {
      items = payload.items.map(item => {
        const ing = ingMap.get(item.ingredientId);
        return {
          ingredientId: item.ingredientId,
          name: item.name || (ing ? ing.name : ''),
          quantity: Number(item.quantity) || 0,
          unit: item.unit || 'g',
          snapshotPurchaseQty: item.snapshotPurchaseQty || (ing ? ing.purchaseQuantity : 1),
          snapshotPurchaseUnit: item.snapshotPurchaseUnit || (ing ? ing.purchaseUnit : 'g'),
          snapshotPurchasePrice: item.snapshotPurchasePrice !== undefined ? item.snapshotPurchasePrice : (ing ? ing.purchasePrice : 0),
          snapshotCostPerBaseUnit: item.snapshotCostPerBaseUnit !== undefined ? item.snapshotCostPerBaseUnit : (ing ? ing.costPerBaseUnit : 0)
        };
      });
    }

    const updated = {
      ...current,
      name: payload.name !== undefined ? payload.name.trim() : current.name,
      category: payload.category !== undefined ? payload.category.trim() : current.category,
      description: payload.description !== undefined ? payload.description.trim() : current.description,
      yieldCount: payload.yieldCount !== undefined ? Number(payload.yieldCount) : current.yieldCount,
      yieldUnit: payload.yieldUnit !== undefined ? payload.yieldUnit.trim() : current.yieldUnit,
      packagingCost: payload.packagingCost !== undefined ? Number(payload.packagingCost) : current.packagingCost,
      labourCost: payload.labourCost !== undefined ? Number(payload.labourCost) : current.labourCost,
      utilitiesCost: payload.utilitiesCost !== undefined ? Number(payload.utilitiesCost) : current.utilitiesCost,
      transportCost: payload.transportCost !== undefined ? Number(payload.transportCost) : current.transportCost,
      otherExpenses: payload.otherExpenses !== undefined ? Number(payload.otherExpenses) : current.otherExpenses,
      wastagePercentage: payload.wastagePercentage !== undefined ? Number(payload.wastagePercentage) : current.wastagePercentage,
      wastageBasis: payload.wastageBasis !== undefined ? payload.wastageBasis : current.wastageBasis,
      pricingStrategy: payload.pricingStrategy !== undefined ? payload.pricingStrategy : current.pricingStrategy,
      targetPercentage: payload.targetPercentage !== undefined ? Number(payload.targetPercentage) : current.targetPercentage,
      useHistoricalPricing: payload.useHistoricalPricing !== undefined ? Boolean(payload.useHistoricalPricing) : current.useHistoricalPricing,
      items,
      updatedAt: new Date().toISOString()
    };

    rawList[index] = updated;
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(rawList));

    return this.calculateFullRecipeCost(updated);
  }

  duplicateRecipe(id, newName = null) {
    const original = this.getRecipeById(id);
    if (!original) return null;

    const copy = {
      ...original,
      name: newName || `${original.name} (Copy)`,
      id: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.createRecipe(copy);
  }

  deleteRecipe(id) {
    const rawList = this.getRawRecipes();
    const index = rawList.findIndex(r => r.id === id);
    if (index === -1) return false;
    rawList.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(rawList));
    return true;
  }

  // --- DASHBOARD ---
  getDashboardStats() {
    const enrichedRecipes = this.getRecipes();

    const sortedByUnitCost = [...enrichedRecipes].sort((a, b) =>
      b.productionCost.costPerProduct - a.productionCost.costPerProduct
    );

    const sortedByMargin = [...enrichedRecipes].sort((a, b) =>
      b.profitAnalysis.profitMarginPercentage - a.profitAnalysis.profitMarginPercentage
    );

    return {
      totalIngredients: this.getIngredients().length,
      totalRecipes: enrichedRecipes.length,
      recentPriceChanges: this.getPriceHistory().slice(0, 10),
      mostExpensiveRecipes: sortedByUnitCost.slice(0, 5),
      highestMarginRecipes: sortedByMargin.slice(0, 5),
      allRecipesOverview: enrichedRecipes.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        yieldCount: r.yieldCount,
        yieldUnit: r.yieldUnit,
        ingredientCost: r.totalIngredientCost,
        totalProductionCost: r.productionCost.totalProductionCost,
        costPerProduct: r.productionCost.costPerProduct,
        suggestedSellingPrice: r.profitAnalysis.suggestedSellingPrice,
        profitPerProduct: r.profitAnalysis.profitPerProduct,
        totalProfitPerBatch: r.profitAnalysis.totalProfitPerBatch,
        marginPct: r.profitAnalysis.profitMarginPercentage,
        markupPct: r.profitAnalysis.markupPercentage
      }))
    };
  }

  // --- BACKUP & RESTORE ---
  exportAllData() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ingredients: this.getIngredients(),
      priceHistory: this.getPriceHistory(),
      recipes: this.getRawRecipes()
    };
  }

  importAllData(data) {
    if (!data || !Array.isArray(data.ingredients) || !Array.isArray(data.recipes)) {
      throw new Error('Invalid backup file structure');
    }
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(data.ingredients));
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(data.priceHistory || []));
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(data.recipes));
    return true;
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(INITIAL_INGREDIENTS));
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(INITIAL_PRICE_HISTORY));
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(INITIAL_RECIPES));
  }
}

export const localStore = new LocalStorageService();
