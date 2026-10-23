import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateIngredientCostInRecipe,
  convertQuantity,
  calculateBaseCost
} from '../src/utils/unitConverter.js';
import {
  calculateRecipeIngredientCosts,
  calculateProductionCost,
  calculateSellingPriceAndProfit
} from '../src/utils/calculations.js';

test('Sample Biscuit Recipe Cost Calculation matches user specification exactly (₹660.51)', () => {
  // 1. Butter: 600 grams, ₹700 per kg -> ₹420.00
  const butterCost = calculateIngredientCostInRecipe({
    recipeQuantity: 600,
    recipeUnit: 'g',
    purchaseQuantity: 1,
    purchaseUnit: 'kg',
    purchasePrice: 700
  });
  assert.equal(butterCost, 420.00, 'Butter cost must be 420.00');

  // 2. Baking Soda: 1.7 grams, ₹30 per 100 grams -> ₹0.51
  const bakingSodaCost = calculateIngredientCostInRecipe({
    recipeQuantity: 1.7,
    recipeUnit: 'g',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30
  });
  assert.equal(bakingSodaCost, 0.51, 'Baking soda cost must be 0.51');

  // 3. Maida (Flour): 800 grams, ₹30 per 100 grams -> ₹240.00
  const flourCost = calculateIngredientCostInRecipe({
    recipeQuantity: 800,
    recipeUnit: 'g',
    purchaseQuantity: 100,
    purchaseUnit: 'g',
    purchasePrice: 30
  });
  assert.equal(flourCost, 240.00, 'Flour cost must be 240.00');

  // Batch recipe ingredient calculation
  const recipe = calculateRecipeIngredientCosts([
    {
      name: 'Butter',
      quantity: 600,
      unit: 'g',
      purchaseQuantity: 1,
      purchaseUnit: 'kg',
      purchasePrice: 700
    },
    {
      name: 'Baking Soda',
      quantity: 1.7,
      unit: 'g',
      purchaseQuantity: 100,
      purchaseUnit: 'g',
      purchasePrice: 30
    },
    {
      name: 'Maida (Flour)',
      quantity: 800,
      unit: 'g',
      purchaseQuantity: 100,
      purchaseUnit: 'g',
      purchasePrice: 30
    }
  ]);

  assert.equal(recipe.totalIngredientCost, 660.51, 'Total recipe ingredient cost must be ₹660.51');
  assert.equal(recipe.items[0].calculatedCost, 420.00);
  assert.equal(recipe.items[1].calculatedCost, 0.51);
  assert.equal(recipe.items[2].calculatedCost, 240.00);
});

test('Unit conversion functions properly across kg, g, litre, ml', () => {
  assert.equal(convertQuantity(1.5, 'kg', 'g'), 1500);
  assert.equal(convertQuantity(500, 'g', 'kg'), 0.5);
  assert.equal(convertQuantity(2, 'l', 'ml'), 2000);
  assert.equal(convertQuantity(250, 'ml', 'l'), 0.25);
  assert.equal(convertQuantity(2, 'dozen', 'piece'), 24);
});

test('Selling Price calculation matches exact example: ₹5 cost, 30% margin gives ₹7.14', () => {
  const result = calculateSellingPriceAndProfit({
    costPerProduct: 5.0,
    yieldCount: 1,
    pricingStrategy: 'margin',
    targetPercentage: 30
  });

  // Selling Price = 5 / (1 - 0.30) = 5 / 0.70 = 7.142857... -> 7.14
  assert.equal(result.suggestedSellingPrice, 7.14);
  assert.equal(result.profitPerProduct, 2.14);
  assert.equal(result.profitMarginPercentage, 30);
});

test('Markup calculation correctly computes Selling Price = Cost * (1 + Markup)', () => {
  const result = calculateSellingPriceAndProfit({
    costPerProduct: 100,
    yieldCount: 10,
    pricingStrategy: 'markup',
    targetPercentage: 50 // 50% markup -> ₹150 selling price
  });

  assert.equal(result.suggestedSellingPrice, 150);
  assert.equal(result.profitPerProduct, 50);
  assert.equal(result.totalProfitPerBatch, 500);
  assert.equal(result.markupPercentage, 50);
});

test('Production cost properly aggregates overheads and wastage without double counting', () => {
  const production = calculateProductionCost({
    ingredientCost: 660.51,
    packagingCost: 40,
    labourCost: 100,
    utilitiesCost: 50,
    transportCost: 30,
    otherExpenses: 20,
    wastagePercentage: 5,
    wastageBasis: 'ingredients', // 5% of 660.51 = 33.0255 -> 33.03
    yieldCount: 50 // 50 biscuits
  });

  // Direct overhead: 660.51 + 40 + 100 + 50 + 30 + 20 = 900.51
  // Wastage (5% on 660.51) = 33.03
  // Total = 900.51 + 33.03 = 933.54
  assert.equal(production.wastageCost, 33.03);
  assert.equal(production.totalProductionCost, 933.54);
  // Cost per biscuit: 933.54 / 50 = 18.6708
  assert.equal(production.costPerProduct, 18.6708);
});
