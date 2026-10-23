import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Layers,
  Calculator,
  Coins,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api.js';
import { exportRecipeToPdf } from '../utils/exportPdf.js';
import { 
  exportRecipeToExcel, 
  exportIngredientsToExcel, 
  exportAllRecipesSummaryToExcel 
} from '../utils/exportExcel.js';
import { formatINR, formatDate } from '../utils/formatters.js';

export default function Reports({ onOpenRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [batchMultiplier, setBatchMultiplier] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recList, ingList] = await Promise.all([
        api.getRecipes(),
        api.getIngredients()
      ]);
      setRecipes(recList);
      setIngredients(ingList);
      if (recList.length > 0) {
        setSelectedRecipeId(recList[0].id);
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];

  // Batch production calculation for planned daily baking run
  const numBatches = Math.max(1, Number(batchMultiplier) || 1);
  const totalFinishedProducts = activeRecipe ? (activeRecipe.yieldCount * numBatches) : 0;
  const totalIngredientCost = activeRecipe ? (activeRecipe.totalIngredientCost * numBatches) : 0;
  const totalProductionCost = activeRecipe ? (activeRecipe.productionCost.totalProductionCost * numBatches) : 0;
  const totalEstimatedRevenue = activeRecipe ? (activeRecipe.profitAnalysis.suggestedSellingPrice * totalFinishedProducts) : 0;
  const totalEstimatedProfit = activeRecipe ? (totalEstimatedRevenue - totalProductionCost) : 0;

  // Aggregate required ingredients for the planned batches
  const requiredMaterials = (activeRecipe?.computedItems || []).map(item => {
    const totalQty = item.quantity * numBatches;
    const totalCost = item.calculatedCost * numBatches;
    return {
      name: item.name,
      totalQty,
      unit: item.unit,
      totalCost
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-amber-600" />
            <span>Bakery Cost Reports & Production Simulator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan daily bake production batches, forecast ingredient demand, and export reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAllRecipesSummaryToExcel(recipes)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>All Recipes Excel</span>
          </button>
          <button
            onClick={() => exportIngredientsToExcel(ingredients)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ingredients Master Excel</span>
          </button>
        </div>
      </div>

      {/* Production Run Planner & Revenue Forecast Simulator */}
      {activeRecipe && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Interactive Simulator
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                <span>Daily Baking Run & Profit Forecaster</span>
              </h3>
              <p className="text-xs text-slate-500">
                Simulate how many batches you plan to bake today to see total ingredients and net profit
              </p>
            </div>

            {/* Select Recipe & Number of Batches */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Select Recipe
                </label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Batches to Bake
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchMultiplier}
                  onChange={(e) => setBatchMultiplier(Number(e.target.value) || 1)}
                  className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-extrabold text-amber-900 text-center focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>
          </div>

          {/* Simulator Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Output Yield
              </span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalFinishedProducts} {activeRecipe.yieldUnit}
              </p>
              <span className="text-[10px] text-slate-400">
                {numBatches} batches × {activeRecipe.yieldCount} {activeRecipe.yieldUnit}
              </span>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                Total Production Cost
              </span>
              <p className="text-2xl font-extrabold text-amber-900 mt-1">
                {formatINR(totalProductionCost)}
              </p>
              <span className="text-[10px] text-amber-700">
                Ingredients: {formatINR(totalIngredientCost)}
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Gross Sales Revenue
              </span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                {formatINR(totalEstimatedRevenue)}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">
                @ {formatINR(activeRecipe.profitAnalysis.suggestedSellingPrice)} / unit
              </span>
            </div>

            <div className="p-4 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 block">
                Net Profit Earned
              </span>
              <p className="text-2xl font-extrabold mt-1">
                +{formatINR(totalEstimatedProfit)}
              </p>
              <span className="text-[10px] text-emerald-100 font-semibold">
                {activeRecipe.profitAnalysis.profitMarginPercentage}% margin
              </span>
            </div>
          </div>

          {/* Pantry Material Requirement List for this Run */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pantry & Raw Material Shopping List ({numBatches} Batches):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {requiredMaterials.map((mat, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">{mat.name}</p>
                      <span className="text-slate-500 text-[11px]">
                        Weight: {mat.totalQty} {mat.unit}
                      </span>
                    </div>
                  </div>
                  <span className="font-extrabold text-amber-900 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {formatINR(mat.totalCost)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Individual Recipe Reports Table with 1-Click PDF / Excel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Downloadable Recipe Costing Sheets
          </h3>
          <p className="text-xs text-slate-500">
            Printable audit-ready production summaries with ingredient matrices, overheads, and target profit margins
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Recipe Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Batch Yield</th>
                <th className="px-4 py-3">Ingredient Cost</th>
                <th className="px-4 py-3">Cost / Unit</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">Batch Profit</th>
                <th className="px-5 py-3 text-right">Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recipes.map((r) => {
                const prod = r.productionCost || {};
                const profit = r.profitAnalysis || {};

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                      {r.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {r.category}
                    </td>
                    <td className="px-4 py-3.5 text-slate-800">
                      {r.yieldCount} {r.yieldUnit}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {formatINR(r.totalIngredientCost)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {formatINR(prod.costPerProduct)}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-emerald-700">
                      {formatINR(profit.suggestedSellingPrice)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-amber-800">
                      +{formatINR(profit.totalProfitPerBatch)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => exportRecipeToPdf(r)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                          title="Download PDF Costing Sheet"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-600" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => exportRecipeToExcel(r)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                          title="Download Excel Workbook"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Excel</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
