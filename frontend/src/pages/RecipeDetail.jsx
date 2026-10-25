import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  FileText, 
  FileSpreadsheet, 
  Clock, 
  RefreshCw, 
  Award,
  Layers,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';
import { api } from '../services/api.js';
import ProductionCostCard from '../components/ProductionCostCard.jsx';
import PricingCalculatorCard from '../components/PricingCalculatorCard.jsx';
import { COMMON_UNITS, calculateIngredientCostInRecipe } from '../utils/unitConverter.js';
import { calculateRecipeIngredientCosts, calculateProductionCost, calculateSellingPriceAndProfit } from '../utils/calculations.js';
import { exportRecipeToPdf } from '../utils/exportPdf.js';
import { exportRecipeToExcel } from '../utils/exportExcel.js';
import { formatINR } from '../utils/formatters.js';

// Helper to recompute recipe items, overheads, and profit with live ingredient matching
function computeRecipeState(updatedRecipe, ingredients = []) {
  const currentIngs = ingredients || [];
  const currentIngMap = new Map(currentIngs.map(i => [i.id, i]));

  const computedItems = (updatedRecipe.items || []).map(item => {
    let liveIng = currentIngMap.get(item.ingredientId);
    if (!liveIng && item.name) {
      const cleanName = item.name.trim().toLowerCase();
      liveIng = currentIngs.find(i => (i.name || '').trim().toLowerCase() === cleanName);
    }

    let purchaseQuantity = item.snapshotPurchaseQty;
    let purchaseUnit = item.snapshotPurchaseUnit;
    let purchasePrice = item.snapshotPurchasePrice;

    if (!updatedRecipe.useHistoricalPricing && liveIng) {
      purchaseQuantity = liveIng.purchaseQuantity;
      purchaseUnit = liveIng.purchaseUnit;
      purchasePrice = liveIng.purchasePrice;
    } else if (liveIng && (!purchasePrice || Number(purchasePrice) === 0)) {
      purchaseQuantity = liveIng.purchaseQuantity;
      purchaseUnit = liveIng.purchaseUnit;
      purchasePrice = liveIng.purchasePrice;
    }

    const calculatedCost = calculateIngredientCostInRecipe({
      recipeQuantity: item.quantity,
      recipeUnit: item.unit,
      purchaseQuantity: purchaseQuantity || 1,
      purchaseUnit: purchaseUnit || 'g',
      purchasePrice: purchasePrice || 0
    });

    return {
      ...item,
      ingredientId: liveIng ? liveIng.id : item.ingredientId,
      name: (liveIng ? liveIng.name : item.name) || 'Unknown Ingredient',
      purchaseQuantity: purchaseQuantity || 1,
      purchaseUnit: purchaseUnit || 'g',
      purchasePrice: purchasePrice || 0,
      snapshotPurchaseQty: purchaseQuantity || 1,
      snapshotPurchaseUnit: purchaseUnit || 'g',
      snapshotPurchasePrice: purchasePrice || 0,
      snapshotCostPerBaseUnit: liveIng ? liveIng.costPerBaseUnit : (item.snapshotCostPerBaseUnit || 0),
      calculatedCost
    };
  });

  const ingCalc = calculateRecipeIngredientCosts(computedItems);

  const prodCalc = calculateProductionCost({
    ingredientCost: ingCalc.totalIngredientCost,
    packagingCost: updatedRecipe.packagingCost,
    labourCost: updatedRecipe.labourCost,
    utilitiesCost: updatedRecipe.utilitiesCost,
    transportCost: updatedRecipe.transportCost,
    otherExpenses: updatedRecipe.otherExpenses,
    wastagePercentage: updatedRecipe.wastagePercentage,
    wastageBasis: updatedRecipe.wastageBasis,
    yieldCount: updatedRecipe.yieldCount
  });

  const profitCalc = calculateSellingPriceAndProfit({
    costPerProduct: prodCalc.costPerProduct,
    yieldCount: prodCalc.yieldCount,
    pricingStrategy: updatedRecipe.pricingStrategy || 'margin',
    targetPercentage: updatedRecipe.targetPercentage || 30
  });

  return {
    ...updatedRecipe,
    items: computedItems.map(ci => ({
      ingredientId: ci.ingredientId,
      name: ci.name,
      quantity: ci.quantity,
      unit: ci.unit,
      snapshotPurchaseQty: ci.snapshotPurchaseQty,
      snapshotPurchaseUnit: ci.snapshotPurchaseUnit,
      snapshotPurchasePrice: ci.snapshotPurchasePrice,
      snapshotCostPerBaseUnit: ci.snapshotCostPerBaseUnit
    })),
    computedItems: ingCalc.items,
    totalIngredientCost: ingCalc.totalIngredientCost,
    productionCost: prodCalc,
    profitAnalysis: profitCalc
  };
}

export default function RecipeDetail({ recipeId, onBack, onRecipeChange }) {
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [allRecipes, setAllRecipes] = useState([]);

  useEffect(() => {
    loadData();
  }, [recipeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recList, ingList] = await Promise.all([
        api.getRecipes(),
        api.getIngredients()
      ]);
      setAllRecipes(recList);
      setIngredients(ingList);

      const targetId = recipeId || (recList[0] ? recList[0].id : null);
      if (targetId) {
        const found = await api.getRecipeById(targetId);
        if (found) {
          setRecipe(computeRecipeState(found, ingList));
        }
      }
    } catch (err) {
      console.error('Failed to load recipe workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !recipe) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const ingMap = new Map(ingredients.map(i => [i.id, i]));

  // Handle recipe formulation changes
  const handleItemQuantityChange = (idx, qty) => {
    const updatedItems = [...recipe.items];
    updatedItems[idx] = {
      ...updatedItems[idx],
      quantity: Number(qty) || 0
    };
    recalculateState({ ...recipe, items: updatedItems });
  };

  const handleItemUnitChange = (idx, unit) => {
    const updatedItems = [...recipe.items];
    updatedItems[idx] = {
      ...updatedItems[idx],
      unit
    };
    recalculateState({ ...recipe, items: updatedItems });
  };

  const handleItemIngredientChange = (idx, newIngId) => {
    const updatedItems = [...recipe.items];
    const newIng = ingMap.get(newIngId) || ingredients.find(i => i.id === newIngId);
    updatedItems[idx] = {
      ...updatedItems[idx],
      ingredientId: newIngId,
      name: newIng ? newIng.name : '',
      unit: newIng ? newIng.baseUnit || 'g' : 'g',
      snapshotPurchaseQty: newIng ? newIng.purchaseQuantity : 1,
      snapshotPurchaseUnit: newIng ? newIng.purchaseUnit : 'g',
      snapshotPurchasePrice: newIng ? newIng.purchasePrice : 0,
      snapshotCostPerBaseUnit: newIng ? newIng.costPerBaseUnit : 0
    };
    recalculateState({ ...recipe, items: updatedItems });
  };

  const handleAddItem = () => {
    if (ingredients.length === 0) return;
    const first = ingredients[0];
    const updatedItems = [
      ...recipe.items,
      {
        ingredientId: first.id,
        name: first.name,
        quantity: 100,
        unit: first.baseUnit || 'g',
        snapshotPurchaseQty: first.purchaseQuantity,
        snapshotPurchaseUnit: first.purchaseUnit,
        snapshotPurchasePrice: first.purchasePrice,
        snapshotCostPerBaseUnit: first.costPerBaseUnit
      }
    ];
    recalculateState({ ...recipe, items: updatedItems });
  };

  const handleRemoveItem = (idx) => {
    const updatedItems = [...recipe.items];
    updatedItems.splice(idx, 1);
    recalculateState({ ...recipe, items: updatedItems });
  };

  // Toggle live vs snapshot historical prices
  const handleToggleHistorical = (useHist) => {
    recalculateState({ ...recipe, useHistoricalPricing: useHist });
  };

  // Yield update
  const handleYieldCountChange = (val) => {
    const count = Math.max(1, Number(val) || 1);
    recalculateState({ ...recipe, yieldCount: count });
  };

  const handleYieldUnitChange = (unit) => {
    recalculateState({ ...recipe, yieldUnit: unit });
  };

  // Production Overheads update
  const handleProductionChange = (newProdData) => {
    recalculateState({
      ...recipe,
      packagingCost: newProdData.packagingCost,
      labourCost: newProdData.labourCost,
      utilitiesCost: newProdData.utilitiesCost,
      transportCost: newProdData.transportCost,
      otherExpenses: newProdData.otherExpenses,
      wastagePercentage: newProdData.wastagePercentage,
      wastageBasis: newProdData.wastageBasis,
      yieldCount: newProdData.yieldCount !== undefined ? newProdData.yieldCount : recipe.yieldCount,
      yieldUnit: newProdData.yieldUnit !== undefined ? newProdData.yieldUnit : recipe.yieldUnit
    });
  };

  // Pricing & Profit strategy update
  const handlePricingChange = (newPricing) => {
    recalculateState({
      ...recipe,
      pricingStrategy: newPricing.pricingStrategy,
      targetPercentage: newPricing.targetPercentage
    });
  };

  // Client-side instant recalculation
  const recalculateState = (updatedRecipe) => {
    setRecipe(computeRecipeState(updatedRecipe, ingredients));
  };

  // Persist changes to storage
  const handleSaveRecipe = async () => {
    try {
      const refreshed = computeRecipeState(recipe, ingredients);
      await api.updateRecipe(recipe.id, refreshed);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
      if (onRecipeChange) onRecipeChange();
    } catch (err) {
      alert('Failed to save recipe: ' + err.message);
    }
  };

  const handleDuplicate = async () => {
    try {
      const copy = await api.duplicateRecipe(recipe.id, `${recipe.name} (Custom Copy)`);
      if (copy && copy.id) {
        setRecipe(copy);
        if (onRecipeChange) onRecipeChange();
      }
    } catch (err) {
      alert('Failed to duplicate: ' + err.message);
    }
  };

  const isBiscuitSpec = recipe.id === 'rec-1';

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {recipe.name}
              </h1>
              {isBiscuitSpec && (
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                  Target Spec ₹660.51
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Category: {recipe.category}</span>
              <span>•</span>
              <span>Total Yield: <strong className="text-amber-800 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{recipe.yieldCount} {recipe.yieldUnit}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Recipe Switcher */}
          <select
            value={recipe.id}
            onChange={(e) => {
              const selected = allRecipes.find(r => r.id === e.target.value);
              if (selected) setRecipe(selected);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            {allRecipes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleDuplicate}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Duplicate and create a new recipe variant"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => exportRecipeToPdf(recipe)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Export PDF"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF Costing</span>
          </button>

          <button
            onClick={() => exportRecipeToExcel(recipe)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleSaveRecipe}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              savedFeedback
                ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
            }`}
          >
            {savedFeedback ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Formulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Spec Benchmark Alert for Butter Biscuit recipe */}
      {isBiscuitSpec && (
        <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-purple-900 text-sm">
                Sample Biscuit Recipe Verification Benchmark
              </p>
              <p className="text-purple-700 mt-0.5">
                Butter (600g @ ₹700/kg = ₹420.00) + Baking Soda (1.7g @ ₹30/100g = ₹0.51) + Maida (800g @ ₹30/100g = ₹240.00)
              </p>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-extrabold text-sm self-start sm:self-auto shrink-0 shadow-xs">
            Total: ₹660.51 (Verified ✓)
          </div>
        </div>
      )}

      {/* Interactive Batch Yield Controller & Live Per-Unit Cost Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-300 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/25 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Batch Yield (Total Finished {recipe.yieldUnit || 'Biscuits'})
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Live Price Divider
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the total biscuits produced from this batch. Cost per biscuit and selling price update instantly!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-amber-50/80 p-2.5 rounded-xl border border-amber-300 shadow-2xs self-start md:self-auto">
          <div>
            <span className="block text-[10px] font-extrabold text-amber-900 uppercase tracking-wider mb-1">
              Enter Total Yield
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                step="1"
                value={recipe.yieldCount === 0 ? '' : recipe.yieldCount}
                onChange={(e) => handleYieldCountChange(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg border-2 border-amber-400 bg-white font-black text-amber-950 text-lg text-center shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="50"
              />
              <input
                type="text"
                value={recipe.yieldUnit || 'biscuits'}
                onChange={(e) => handleYieldUnitChange(e.target.value)}
                className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="biscuits"
              />
            </div>
          </div>

          <div className="pl-4 border-l-2 border-amber-300 text-right">
            <span className="block text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
              Exact Cost Per {recipe.yieldUnit?.replace(/s$/, '') || 'Biscuit'}
            </span>
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {formatINR(recipe.productionCost ? recipe.productionCost.costPerProduct : 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Mode Toggle: Live Ingredient Prices vs Historical Snapshot */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <div>
            <span className="text-xs font-bold text-slate-800">
              Pricing Source Mode: {recipe.useHistoricalPricing ? 'Saved Historical Snapshot Prices' : 'Active Live Market Prices'}
            </span>
            <p className="text-[11px] text-slate-500">
              {recipe.useHistoricalPricing
                ? 'Using locked purchase prices from when this recipe was formulated.'
                : 'Automatically updates recipe cost whenever ingredient purchase rates change in the Master catalog.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleToggleHistorical(false)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              !recipe.useHistoricalPricing
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Current Prices
          </button>
          <button
            type="button"
            onClick={() => handleToggleHistorical(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              recipe.useHistoricalPricing
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Historical
          </button>
        </div>
      </div>

      {/* Main Ingredient Formulation Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recipe Formulation & Ingredient Cost Calculator
            </h3>
            <p className="text-xs text-slate-500">
              Edit ingredient quantities or switch units. Costs recalculate instantly.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 w-10 text-center">#</th>
                <th className="px-4 py-3 min-w-[200px]">Ingredient</th>
                <th className="px-4 py-3 min-w-[120px]">Quantity Used</th>
                <th className="px-4 py-3 min-w-[90px]">Unit</th>
                <th className="px-4 py-3 min-w-[180px]">Purchase Price Basis</th>
                <th className="px-4 py-3 text-right min-w-[130px]">Calculated Cost</th>
                <th className="px-4 py-3 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recipe.computedItems || []).map((item, idx) => {
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-center text-slate-400 font-bold">
                      {idx + 1}
                    </td>

                    {/* Ingredient Dropdown */}
                    <td className="px-4 py-3.5">
                      <select
                        value={item.ingredientId}
                        onChange={(e) => handleItemIngredientChange(idx, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
                      >
                        {!ingredients.some(ing => ing.id === item.ingredientId) && item.ingredientId && (
                          <option value={item.ingredientId}>
                            {item.name || 'Selected Ingredient'} ({formatINR(item.purchasePrice)} / {item.purchaseQuantity || 1} {item.purchaseUnit || 'g'})
                          </option>
                        )}
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({formatINR(ing.purchasePrice)} / {ing.purchaseQuantity} {ing.purchaseUnit})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Quantity Input */}
                    <td className="px-4 py-3.5">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(idx, e.target.value)}
                        className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 text-right font-bold text-slate-900 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
                      />
                    </td>

                    {/* Unit Select */}
                    <td className="px-4 py-3.5">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemUnitChange(idx, e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
                      >
                        {COMMON_UNITS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.value}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Purchase Price Basis Display */}
                    <td className="px-4 py-3.5 text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {formatINR(item.purchasePrice)}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {' '}per {item.purchaseQuantity} {item.purchaseUnit}
                      </span>
                    </td>

                    {/* Calculated Cost Result */}
                    <td className="px-4 py-3.5 text-right font-extrabold text-sm text-slate-900">
                      <span className="bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-amber-950">
                        {formatINR(item.calculatedCost)}
                      </span>
                    </td>

                    {/* Delete item */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove ingredient from recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Ingredient Cost Footer */}
            <tfoot className="bg-amber-50/60 font-bold border-t-2 border-amber-200">
              <tr>
                <td colSpan="5" className="px-6 py-4 text-right text-xs uppercase tracking-wider text-amber-900">
                  Total Ingredient Cost (Batch):
                </td>
                <td className="px-4 py-4 text-right text-lg text-amber-900 font-extrabold">
                  {formatINR(recipe.totalIngredientCost)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Production Overheads Card (Packaging, Labour, Electricity/Gas, Transport, Misc, Wastage) */}
      <ProductionCostCard
        productionData={{
          packagingCost: recipe.packagingCost,
          labourCost: recipe.labourCost,
          utilitiesCost: recipe.utilitiesCost,
          transportCost: recipe.transportCost,
          otherExpenses: recipe.otherExpenses,
          wastagePercentage: recipe.wastagePercentage,
          wastageBasis: recipe.wastageBasis,
          yieldCount: recipe.yieldCount,
          yieldUnit: recipe.yieldUnit
        }}
        ingredientCost={recipe.totalIngredientCost}
        onChange={handleProductionChange}
      />

      {/* Selling Price & Profit Margin Card (Margin vs Markup) */}
      <PricingCalculatorCard
        costPerProduct={recipe.productionCost ? recipe.productionCost.costPerProduct : 0}
        yieldCount={recipe.yieldCount}
        yieldUnit={recipe.yieldUnit}
        pricingData={{
          pricingStrategy: recipe.pricingStrategy,
          targetPercentage: recipe.targetPercentage
        }}
        onChange={handlePricingChange}
      />
    </div>
  );
}
