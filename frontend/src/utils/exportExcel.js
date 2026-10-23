import * as XLSX from 'xlsx';

export function exportRecipeToExcel(recipe) {
  if (!recipe) return;

  const prod = recipe.productionCost || {};
  const profit = recipe.profitAnalysis || {};

  // Sheet 1: Detailed Recipe Costing
  const recipeData = [
    ['BAKERY PRODUCT COSTING REPORT'],
    ['Recipe Name', recipe.name],
    ['Category', recipe.category],
    ['Batch Yield', `${recipe.yieldCount} ${recipe.yieldUnit}`],
    ['Pricing Strategy', `${profit.pricingStrategy} (${profit.targetPercentage}%)`],
    ['Cost Per Product', prod.costPerProduct],
    ['Suggested Selling Price', profit.suggestedSellingPrice],
    ['Profit Per Product', profit.profitPerProduct],
    ['Total Batch Profit', profit.totalProfitPerBatch],
    [],
    ['INGREDIENT BREAKDOWN'],
    ['#', 'Ingredient', 'Quantity', 'Unit', 'Purchase Qty', 'Purchase Unit', 'Purchase Price (INR)', 'Calculated Cost (INR)']
  ];

  (recipe.computedItems || []).forEach((item, idx) => {
    recipeData.push([
      idx + 1,
      item.name,
      item.quantity,
      item.unit,
      item.purchaseQuantity,
      item.purchaseUnit,
      item.purchasePrice,
      item.calculatedCost
    ]);
  });

  recipeData.push([]);
  recipeData.push(['TOTAL INGREDIENT COST', '', '', '', '', '', '', recipe.totalIngredientCost]);
  recipeData.push([]);
  recipeData.push(['OVERHEADS & WASTAGE']);
  recipeData.push(['Packaging Cost', prod.packagingCost]);
  recipeData.push(['Labour Cost', prod.labourCost]);
  recipeData.push(['Utilities Cost', prod.utilitiesCost]);
  recipeData.push(['Transportation Cost', prod.transportCost]);
  recipeData.push(['Other Expenses', prod.otherExpenses]);
  recipeData.push([`Wastage Cost (${prod.wastagePercentage}% on ${prod.wastageBasis})`, prod.wastageCost]);
  recipeData.push(['TOTAL PRODUCTION COST', prod.totalProductionCost]);

  const ws1 = XLSX.utils.aoa_to_sheet(recipeData);

  // Set column widths
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 22 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Recipe Costing');

  const cleanName = (recipe.name || 'recipe').replace(/[^a-zA-Z0-9-_]/g, '_');
  XLSX.writeFile(wb, `${cleanName}_costing.xlsx`);
}

export function exportIngredientsToExcel(ingredients = []) {
  const data = [
    ['INGREDIENTS MASTER LIST'],
    ['Export Date', new Date().toLocaleDateString('en-IN')],
    [],
    ['#', 'Name', 'Category', 'Purchase Qty', 'Purchase Unit', 'Purchase Price (INR)', 'Base Unit', 'Cost / Base Unit (INR)', 'Supplier', 'Last Purchased']
  ];

  ingredients.forEach((item, idx) => {
    data.push([
      idx + 1,
      item.name,
      item.category,
      item.purchaseQuantity,
      item.purchaseUnit,
      item.purchasePrice,
      item.baseUnit,
      item.costPerBaseUnit,
      item.supplierName || '—',
      item.lastPurchaseDate || '—'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 12 },
    { wch: 22 },
    { wch: 24 },
    { wch: 16 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ingredients Master');
  XLSX.writeFile(wb, `bakery_ingredients_master_${Date.now()}.xlsx`);
}

export function exportAllRecipesSummaryToExcel(recipes = []) {
  const data = [
    ['ALL RECIPES COSTING SUMMARY'],
    ['Generated', new Date().toLocaleDateString('en-IN')],
    [],
    ['#', 'Recipe Name', 'Category', 'Batch Yield', 'Ingredient Cost', 'Production Cost', 'Cost / Unit', 'Selling Price', 'Profit / Unit', 'Batch Profit', 'Margin %', 'Markup %']
  ];

  recipes.forEach((r, idx) => {
    const prod = r.productionCost || {};
    const profit = r.profitAnalysis || {};

    data.push([
      idx + 1,
      r.name,
      r.category,
      `${r.yieldCount} ${r.yieldUnit}`,
      r.totalIngredientCost,
      prod.totalProductionCost,
      prod.costPerProduct,
      profit.suggestedSellingPrice,
      profit.profitPerProduct,
      profit.totalProfitPerBatch,
      profit.profitMarginPercentage,
      profit.markupPercentage
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'All Recipes Summary');
  XLSX.writeFile(wb, `bakery_recipes_summary_${Date.now()}.xlsx`);
}
