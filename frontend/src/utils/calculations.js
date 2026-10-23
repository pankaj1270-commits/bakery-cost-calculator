import { calculateIngredientCostInRecipe } from './unitConverter.js';

export function round2(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
}

export function round4(num) {
  return Math.round((Number(num) + Number.EPSILON) * 10000) / 10000;
}

export function calculateRecipeIngredientCosts(ingredients = []) {
  let totalIngredientCost = 0;

  const items = ingredients.map((item) => {
    const cost = calculateIngredientCostInRecipe({
      recipeQuantity: item.quantity,
      recipeUnit: item.unit,
      purchaseQuantity: item.purchaseQuantity,
      purchaseUnit: item.purchaseUnit,
      purchasePrice: item.purchasePrice
    });

    totalIngredientCost += cost;

    return {
      ...item,
      calculatedCost: round2(cost)
    };
  });

  return {
    items,
    totalIngredientCost: round2(totalIngredientCost)
  };
}

export function calculateProductionCost({
  ingredientCost = 0,
  packagingCost = 0,
  labourCost = 0,
  utilitiesCost = 0,
  transportCost = 0,
  otherExpenses = 0,
  wastagePercentage = 0,
  wastageBasis = 'ingredients', // 'ingredients' or 'total'
  yieldCount = 1
}) {
  const ingCost = Number(ingredientCost) || 0;
  const pkgCost = Number(packagingCost) || 0;
  const labCost = Number(labourCost) || 0;
  const utilCost = Number(utilitiesCost) || 0;
  const transCost = Number(transportCost) || 0;
  const otherCost = Number(otherExpenses) || 0;
  const wastePct = Math.max(0, Number(wastagePercentage) || 0);
  const totalYield = Math.max(1, Number(yieldCount) || 1);

  const directSubtotal = ingCost + pkgCost + labCost + utilCost + transCost + otherCost;

  let rawWastageCost = 0;
  if (wastePct > 0) {
    if (wastageBasis === 'total') {
      rawWastageCost = directSubtotal * (wastePct / 100);
    } else {
      rawWastageCost = ingCost * (wastePct / 100);
    }
  }

  const wastageCost = round2(rawWastageCost);
  const totalProductionCost = round2(directSubtotal + wastageCost);
  const costPerProduct = totalProductionCost / totalYield;

  return {
    ingredientCost: round2(ingCost),
    packagingCost: round2(pkgCost),
    labourCost: round2(labCost),
    utilitiesCost: round2(utilCost),
    transportCost: round2(transCost),
    otherExpenses: round2(otherCost),
    wastagePercentage: round2(wastePct),
    wastageBasis,
    wastageCost,
    totalProductionCost,
    yieldCount: totalYield,
    costPerProduct: round4(costPerProduct)
  };
}

export function calculateSellingPriceAndProfit({
  costPerProduct = 0,
  yieldCount = 1,
  pricingStrategy = 'margin', // 'margin' or 'markup'
  targetPercentage = 30
}) {
  const cost = Number(costPerProduct) || 0;
  const totalYield = Math.max(1, Number(yieldCount) || 1);
  const targetPct = Number(targetPercentage) || 0;

  let sellingPrice = 0;
  let marginPct = 0;
  let markupPct = 0;

  if (pricingStrategy === 'margin') {
    if (targetPct >= 100) {
      return {
        pricingStrategy,
        targetPercentage: targetPct,
        costPerProduct: round2(cost),
        suggestedSellingPrice: round2(cost * 2),
        profitPerProduct: round2(cost),
        totalProfitPerBatch: round2(cost * totalYield),
        totalBatchRevenue: round2(cost * 2 * totalYield),
        profitMarginPercentage: targetPct,
        markupPercentage: 100,
        error: 'Margin cannot be 100% or greater'
      };
    }
    const marginRatio = Math.max(0, targetPct) / 100;
    sellingPrice = marginRatio < 1 ? cost / (1 - marginRatio) : cost;
    marginPct = targetPct;
    markupPct = cost > 0 ? ((sellingPrice - cost) / cost) * 100 : 0;
  } else {
    const markupRatio = Math.max(0, targetPct) / 100;
    sellingPrice = cost * (1 + markupRatio);
    markupPct = targetPct;
    marginPct = sellingPrice > 0 ? ((sellingPrice - cost) / sellingPrice) * 100 : 0;
  }

  const roundedSellingPrice = round2(sellingPrice);
  const profitPerProduct = roundedSellingPrice - cost;
  const totalProfitPerBatch = profitPerProduct * totalYield;
  const totalBatchRevenue = roundedSellingPrice * totalYield;

  return {
    pricingStrategy,
    targetPercentage: round2(targetPct),
    costPerProduct: round2(cost),
    suggestedSellingPrice: roundedSellingPrice,
    profitPerProduct: round2(profitPerProduct),
    totalProfitPerBatch: round2(totalProfitPerBatch),
    totalBatchRevenue: round2(totalBatchRevenue),
    profitMarginPercentage: round2(marginPct),
    markupPercentage: round2(markupPct)
  };
}
