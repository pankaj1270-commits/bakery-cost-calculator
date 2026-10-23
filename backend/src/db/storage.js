import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateBaseCost } from '../utils/unitConverter.js';
import { calculateRecipeIngredientCosts, calculateProductionCost, calculateSellingPriceAndProfit } from '../utils/calculations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'bakery_data.json');

const INITIAL_INGREDIENTS = [
  {
    id: 'ing-1',
    name: 'Butter',
    category: 'Dairy',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 700,
    costPerBaseUnit: 0.70, // ₹0.70 per gram
    baseUnit: 'g',
    supplierName: 'Amul Dairy Dist.',
    lastPurchaseDate: '2026-10-15',
    notes: 'Premium unsalted butter for baking',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-2',
    name: 'Baking Soda',
    category: 'Leavening Agents',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30,
    costPerBaseUnit: 0.30, // ₹0.30 per gram
    baseUnit: 'g',
    supplierName: 'Weikfield Suppliers',
    lastPurchaseDate: '2026-10-10',
    notes: 'Standard sodium bicarbonate',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-3',
    name: 'Maida (Flour)',
    category: 'Grains & Flour',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30,
    costPerBaseUnit: 0.30, // ₹0.30 per gram (₹300/kg)
    baseUnit: 'g',
    supplierName: 'Aashirvaad Wholesale',
    lastPurchaseDate: '2026-10-18',
    notes: 'Refined wheat flour, double sifted',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-4',
    name: 'Castor Sugar',
    category: 'Sweeteners',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 55,
    costPerBaseUnit: 0.055,
    baseUnit: 'g',
    supplierName: 'Madhur Sugar Ltd',
    lastPurchaseDate: '2026-10-12',
    notes: 'Fine baking sugar',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-5',
    name: 'Dark Chocolate Chips',
    category: 'Chocolates & Cocoa',
    purchaseQuantity: 500,
    purchaseUnit: 'g',
    purchasePrice: 280,
    costPerBaseUnit: 0.56,
    baseUnit: 'g',
    supplierName: 'Van Houten Choco',
    lastPurchaseDate: '2026-10-14',
    notes: '55% cocoa compound drops',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-6',
    name: 'Eggs',
    category: 'Dairy & Eggs',
    purchaseQuantity: 12,
    purchaseUnit: 'piece',
    purchasePrice: 84,
    costPerBaseUnit: 7.00,
    baseUnit: 'piece',
    supplierName: 'Farm Fresh Poultry',
    lastPurchaseDate: '2026-10-20',
    notes: 'Grade A fresh farm eggs',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-7',
    name: 'Vanilla Extract',
    category: 'Flavourings & Colours',
    purchaseQuantity: 100,
    purchaseUnit: 'ml',
    purchasePrice: 220,
    costPerBaseUnit: 2.20,
    baseUnit: 'ml',
    supplierName: 'Ossoro Flavours',
    lastPurchaseDate: '2026-09-28',
    notes: 'Pure bourbon vanilla extract',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-8',
    name: 'Full Cream Milk',
    category: 'Dairy',
    purchaseQuantity: 1,
    purchaseUnit: 'l',
    purchasePrice: 68,
    costPerBaseUnit: 0.068,
    baseUnit: 'ml',
    supplierName: 'Mother Dairy',
    lastPurchaseDate: '2026-10-22',
    notes: 'Pasteurized homogenized milk',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-9',
    name: 'Cocoa Powder',
    category: 'Chocolates & Cocoa',
    purchaseQuantity: 250,
    purchaseUnit: 'g',
    purchasePrice: 190,
    costPerBaseUnit: 0.76,
    baseUnit: 'g',
    supplierName: 'Cadbury Foodservice',
    lastPurchaseDate: '2026-10-05',
    notes: 'Dutch processed cocoa',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ing-10',
    name: 'Instant Dry Yeast',
    category: 'Leavening Agents',
    purchaseQuantity: 50,
    purchaseUnit: 'g',
    purchasePrice: 48,
    costPerBaseUnit: 0.96,
    baseUnit: 'g',
    supplierName: 'Puratos India',
    lastPurchaseDate: '2026-10-01',
    notes: 'Fast acting dry yeast for breads',
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_PRICE_HISTORY = [
  {
    id: 'ph-1',
    ingredientId: 'ing-1',
    ingredientName: 'Butter',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 650,
    costPerBaseUnit: 0.65,
    effectiveDate: '2026-08-10',
    reason: 'Initial vendor quote'
  },
  {
    id: 'ph-2',
    ingredientId: 'ing-1',
    ingredientName: 'Butter',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 700,
    costPerBaseUnit: 0.70,
    effectiveDate: '2026-10-15',
    reason: 'Dairy seasonal market increase'
  },
  {
    id: 'ph-3',
    ingredientId: 'ing-2',
    ingredientName: 'Baking Soda',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30,
    costPerBaseUnit: 0.30,
    effectiveDate: '2026-10-10',
    reason: 'Standard procurement'
  },
  {
    id: 'ph-4',
    ingredientId: 'ing-3',
    ingredientName: 'Maida (Flour)',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30,
    costPerBaseUnit: 0.30,
    effectiveDate: '2026-10-18',
    reason: 'Regular bulk purchase'
  }
];

const INITIAL_RECIPES = [
  {
    id: 'rec-1',
    name: 'Butter Biscuits (Sample Spec)',
    category: 'Biscuits & Cookies',
    description: 'Crisp, rich bakery style butter biscuits matching the exact sample recipe.',
    yieldCount: 50,
    yieldUnit: 'biscuits',
    packagingCost: 40.00,
    labourCost: 100.00,
    utilitiesCost: 50.00,
    transportCost: 30.00,
    otherExpenses: 20.00,
    wastagePercentage: 5.0,
    wastageBasis: 'ingredients', // 'ingredients' or 'total'
    pricingStrategy: 'margin', // 'margin' or 'markup'
    targetPercentage: 30.0, // 30% margin
    useHistoricalPricing: false,
    items: [
      {
        ingredientId: 'ing-1',
        name: 'Butter',
        quantity: 600,
        unit: 'g',
        // snapshot values for historical pricing
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 700,
        snapshotCostPerBaseUnit: 0.70
      },
      {
        ingredientId: 'ing-2',
        name: 'Baking Soda',
        quantity: 1.7,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-3',
        name: 'Maida (Flour)',
        quantity: 800,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      }
    ],
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-2',
    name: 'Chocolate Chip Cookies',
    category: 'Biscuits & Cookies',
    description: 'Chewy golden cookies loaded with dark chocolate chunks.',
    yieldCount: 24,
    yieldUnit: 'cookies',
    packagingCost: 25.00,
    labourCost: 60.00,
    utilitiesCost: 35.00,
    transportCost: 15.00,
    otherExpenses: 10.00,
    wastagePercentage: 3.0,
    wastageBasis: 'ingredients',
    pricingStrategy: 'margin',
    targetPercentage: 35.0,
    useHistoricalPricing: false,
    items: [
      {
        ingredientId: 'ing-1',
        name: 'Butter',
        quantity: 200,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 700,
        snapshotCostPerBaseUnit: 0.70
      },
      {
        ingredientId: 'ing-4',
        name: 'Castor Sugar',
        quantity: 180,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 55,
        snapshotCostPerBaseUnit: 0.055
      },
      {
        ingredientId: 'ing-3',
        name: 'Maida (Flour)',
        quantity: 280,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-2',
        name: 'Baking Soda',
        quantity: 2,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-5',
        name: 'Dark Chocolate Chips',
        quantity: 150,
        unit: 'g',
        snapshotPurchaseQty: 500,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 280,
        snapshotCostPerBaseUnit: 0.56
      },
      {
        ingredientId: 'ing-6',
        name: 'Eggs',
        quantity: 1,
        unit: 'piece',
        snapshotPurchaseQty: 12,
        snapshotPurchaseUnit: 'piece',
        snapshotPurchasePrice: 84,
        snapshotCostPerBaseUnit: 7.00
      },
      {
        ingredientId: 'ing-7',
        name: 'Vanilla Extract',
        quantity: 5,
        unit: 'ml',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'ml',
        snapshotPurchasePrice: 220,
        snapshotCostPerBaseUnit: 2.20
      }
    ],
    createdAt: '2026-10-21T11:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-3',
    name: 'Vanilla Sponge Cake',
    category: 'Cakes & Pastries',
    description: 'Fluffy, moist two-layer vanilla sponge cake for celebrations.',
    yieldCount: 1,
    yieldUnit: 'cake (1 kg)',
    packagingCost: 50.00,
    labourCost: 120.00,
    utilitiesCost: 60.00,
    transportCost: 40.00,
    otherExpenses: 25.00,
    wastagePercentage: 4.0,
    wastageBasis: 'ingredients',
    pricingStrategy: 'margin',
    targetPercentage: 40.0,
    useHistoricalPricing: false,
    items: [
      {
        ingredientId: 'ing-3',
        name: 'Maida (Flour)',
        quantity: 250,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-4',
        name: 'Castor Sugar',
        quantity: 200,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 55,
        snapshotCostPerBaseUnit: 0.055
      },
      {
        ingredientId: 'ing-1',
        name: 'Butter',
        quantity: 120,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 700,
        snapshotCostPerBaseUnit: 0.70
      },
      {
        ingredientId: 'ing-6',
        name: 'Eggs',
        quantity: 4,
        unit: 'piece',
        snapshotPurchaseQty: 12,
        snapshotPurchaseUnit: 'piece',
        snapshotPurchasePrice: 84,
        snapshotCostPerBaseUnit: 7.00
      },
      {
        ingredientId: 'ing-8',
        name: 'Full Cream Milk',
        quantity: 120,
        unit: 'ml',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'l',
        snapshotPurchasePrice: 68,
        snapshotCostPerBaseUnit: 0.068
      },
      {
        ingredientId: 'ing-7',
        name: 'Vanilla Extract',
        quantity: 10,
        unit: 'ml',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'ml',
        snapshotPurchasePrice: 220,
        snapshotCostPerBaseUnit: 2.20
      }
    ],
    createdAt: '2026-10-22T14:30:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rec-4',
    name: 'Artisan Milk Bread Loaf',
    category: 'Breads',
    description: 'Soft sandwich bread loaf prepared with whole milk and natural yeast.',
    yieldCount: 2,
    yieldUnit: 'loaves',
    packagingCost: 15.00,
    labourCost: 45.00,
    utilitiesCost: 30.00,
    transportCost: 10.00,
    otherExpenses: 5.00,
    wastagePercentage: 2.5,
    wastageBasis: 'ingredients',
    pricingStrategy: 'markup',
    targetPercentage: 45.0,
    useHistoricalPricing: false,
    items: [
      {
        ingredientId: 'ing-3',
        name: 'Maida (Flour)',
        quantity: 500,
        unit: 'g',
        snapshotPurchaseQty: 100,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 30,
        snapshotCostPerBaseUnit: 0.30
      },
      {
        ingredientId: 'ing-8',
        name: 'Full Cream Milk',
        quantity: 320,
        unit: 'ml',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'l',
        snapshotPurchasePrice: 68,
        snapshotCostPerBaseUnit: 0.068
      },
      {
        ingredientId: 'ing-1',
        name: 'Butter',
        quantity: 40,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 700,
        snapshotCostPerBaseUnit: 0.70
      },
      {
        ingredientId: 'ing-4',
        name: 'Castor Sugar',
        quantity: 30,
        unit: 'g',
        snapshotPurchaseQty: 1,
        snapshotPurchaseUnit: 'kg',
        snapshotPurchasePrice: 55,
        snapshotCostPerBaseUnit: 0.055
      },
      {
        ingredientId: 'ing-10',
        name: 'Instant Dry Yeast',
        quantity: 7,
        unit: 'g',
        snapshotPurchaseQty: 50,
        snapshotPurchaseUnit: 'g',
        snapshotPurchasePrice: 48,
        snapshotCostPerBaseUnit: 0.96
      }
    ],
    createdAt: '2026-10-23T09:15:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

class Storage {
  constructor() {
    this.data = {
      ingredients: [],
      priceHistory: [],
      recipes: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = {
          ingredients: INITIAL_INGREDIENTS,
          priceHistory: INITIAL_PRICE_HISTORY,
          recipes: INITIAL_RECIPES
        };
        this.save();
      }
    } catch (err) {
      console.error('Error loading data, using initial data:', err);
      this.data = {
        ingredients: INITIAL_INGREDIENTS,
        priceHistory: INITIAL_PRICE_HISTORY,
        recipes: INITIAL_RECIPES
      };
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data:', err);
    }
  }

  // --- INGREDIENTS ---
  getIngredients(category = null, search = '') {
    let list = this.data.ingredients;
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
    return this.data.ingredients.find(i => i.id === id);
  }

  createIngredient(payload) {
    const {
      name,
      category = 'General',
      purchaseQuantity = 1,
      purchaseUnit = 'kg',
      purchasePrice = 0,
      supplierName = '',
      lastPurchaseDate = new Date().toISOString().split('T')[0],
      notes = ''
    } = payload;

    const { costPerBaseUnit, baseUnit } = calculateBaseCost(purchaseQuantity, purchaseUnit, purchasePrice);

    const newIng = {
      id: 'ing-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      category: category.trim(),
      purchaseQuantity: Number(purchaseQuantity),
      purchaseUnit,
      purchasePrice: Number(purchasePrice),
      costPerBaseUnit,
      baseUnit,
      supplierName: supplierName.trim(),
      lastPurchaseDate,
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    };

    this.data.ingredients.unshift(newIng);

    // Record initial price in history
    this.data.priceHistory.unshift({
      id: 'ph-' + Date.now(),
      ingredientId: newIng.id,
      ingredientName: newIng.name,
      purchaseQuantity: newIng.purchaseQuantity,
      purchaseUnit: newIng.purchaseUnit,
      purchasePrice: newIng.purchasePrice,
      costPerBaseUnit: newIng.costPerBaseUnit,
      effectiveDate: newIng.lastPurchaseDate,
      reason: 'Initial creation'
    });

    this.save();
    return newIng;
  }

  updateIngredient(id, payload) {
    const index = this.data.ingredients.findIndex(i => i.id === id);
    if (index === -1) return null;

    const current = this.data.ingredients[index];
    const {
      name = current.name,
      category = current.category,
      purchaseQuantity = current.purchaseQuantity,
      purchaseUnit = current.purchaseUnit,
      purchasePrice = current.purchasePrice,
      supplierName = current.supplierName,
      lastPurchaseDate = current.lastPurchaseDate,
      notes = current.notes,
      priceChangeReason = 'Price update'
    } = payload;

    const { costPerBaseUnit, baseUnit } = calculateBaseCost(purchaseQuantity, purchaseUnit, purchasePrice);

    const priceChanged = (Number(purchasePrice) !== current.purchasePrice) ||
      (Number(purchaseQuantity) !== current.purchaseQuantity) ||
      (purchaseUnit !== current.purchaseUnit);

    const updated = {
      ...current,
      name: name.trim(),
      category: category.trim(),
      purchaseQuantity: Number(purchaseQuantity),
      purchaseUnit,
      purchasePrice: Number(purchasePrice),
      costPerBaseUnit,
      baseUnit,
      supplierName: supplierName ? supplierName.trim() : '',
      lastPurchaseDate,
      notes: notes ? notes.trim() : '',
      updatedAt: new Date().toISOString()
    };

    this.data.ingredients[index] = updated;

    if (priceChanged) {
      this.data.priceHistory.unshift({
        id: 'ph-' + Date.now(),
        ingredientId: updated.id,
        ingredientName: updated.name,
        purchaseQuantity: updated.purchaseQuantity,
        purchaseUnit: updated.purchaseUnit,
        purchasePrice: updated.purchasePrice,
        costPerBaseUnit: updated.costPerBaseUnit,
        effectiveDate: lastPurchaseDate || new Date().toISOString().split('T')[0],
        reason: priceChangeReason
      });
    }

    this.save();
    return updated;
  }

  deleteIngredient(id) {
    const index = this.data.ingredients.findIndex(i => i.id === id);
    if (index === -1) return false;

    // Check if ingredient is used in any recipes
    const usedInRecipes = this.data.recipes.filter(r => 
      r.items && r.items.some(item => item.ingredientId === id)
    );

    if (usedInRecipes.length > 0) {
      const names = usedInRecipes.map(r => r.name).join(', ');
      throw new Error(`Cannot delete: ingredient is currently used in ${usedInRecipes.length} recipe(s): ${names}`);
    }

    this.data.ingredients.splice(index, 1);
    this.save();
    return true;
  }

  getPriceHistory(ingredientId = null) {
    if (ingredientId) {
      return this.data.priceHistory.filter(ph => ph.ingredientId === ingredientId);
    }
    return this.data.priceHistory.slice(0, 50);
  }

  // --- RECIPES ---
  getRecipes(category = null, search = '') {
    let list = this.data.recipes;
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

    // Enrich each recipe with computed costs
    return list.map(recipe => this.calculateFullRecipeCost(recipe));
  }

  getRecipeById(id) {
    const recipe = this.data.recipes.find(r => r.id === id);
    if (!recipe) return null;
    return this.calculateFullRecipeCost(recipe);
  }

  calculateFullRecipeCost(recipe) {
    const ingredientsMap = new Map(this.data.ingredients.map(i => [i.id, i]));

    const computedItems = (recipe.items || []).map(item => {
      const liveIng = ingredientsMap.get(item.ingredientId);

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
    const {
      name,
      category = 'Bakery',
      description = '',
      yieldCount = 1,
      yieldUnit = 'pieces',
      packagingCost = 0,
      labourCost = 0,
      utilitiesCost = 0,
      transportCost = 0,
      otherExpenses = 0,
      wastagePercentage = 0,
      wastageBasis = 'ingredients',
      pricingStrategy = 'margin',
      targetPercentage = 30,
      useHistoricalPricing = false,
      items = []
    } = payload;

    const ingredientsMap = new Map(this.data.ingredients.map(i => [i.id, i]));

    const snapshotItems = items.map(item => {
      const ing = ingredientsMap.get(item.ingredientId);
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
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      yieldCount: Number(yieldCount) || 1,
      yieldUnit: (yieldUnit || 'pieces').trim(),
      packagingCost: Number(packagingCost) || 0,
      labourCost: Number(labourCost) || 0,
      utilitiesCost: Number(utilitiesCost) || 0,
      transportCost: Number(transportCost) || 0,
      otherExpenses: Number(otherExpenses) || 0,
      wastagePercentage: Number(wastagePercentage) || 0,
      wastageBasis: wastageBasis || 'ingredients',
      pricingStrategy: pricingStrategy || 'margin',
      targetPercentage: Number(targetPercentage) || 30,
      useHistoricalPricing: Boolean(useHistoricalPricing),
      items: snapshotItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.recipes.unshift(newRecipe);
    this.save();

    return this.calculateFullRecipeCost(newRecipe);
  }

  updateRecipe(id, payload) {
    const index = this.data.recipes.findIndex(r => r.id === id);
    if (index === -1) return null;

    const current = this.data.recipes[index];
    const ingredientsMap = new Map(this.data.ingredients.map(i => [i.id, i]));

    let items = current.items;
    if (payload.items) {
      items = payload.items.map(item => {
        const ing = ingredientsMap.get(item.ingredientId);
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

    this.data.recipes[index] = updated;
    this.save();

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
    const index = this.data.recipes.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.data.recipes.splice(index, 1);
    this.save();
    return true;
  }

  // --- DASHBOARD STATS ---
  getDashboardStats() {
    const enrichedRecipes = this.data.recipes.map(r => this.calculateFullRecipeCost(r));
    
    // Sort recipes by cost per product descending
    const sortedByUnitCost = [...enrichedRecipes].sort((a, b) => 
      b.productionCost.costPerProduct - a.productionCost.costPerProduct
    );

    // Most profitable by margin
    const sortedByMargin = [...enrichedRecipes].sort((a, b) =>
      b.profitAnalysis.profitMarginPercentage - a.profitAnalysis.profitMarginPercentage
    );

    return {
      totalIngredients: this.data.ingredients.length,
      totalRecipes: this.data.recipes.length,
      recentPriceChanges: this.data.priceHistory.slice(0, 10),
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
}

export const storage = new Storage();
