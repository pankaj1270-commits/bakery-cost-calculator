import React from 'react';
import { 
  Package, 
  Users, 
  Zap, 
  Truck, 
  HelpCircle, 
  Trash2, 
  Layers, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

export default function ProductionCostCard({
  productionData,
  ingredientCost = 0,
  onChange
}) {
  const {
    packagingCost = 0,
    labourCost = 0,
    utilitiesCost = 0,
    transportCost = 0,
    otherExpenses = 0,
    wastagePercentage = 0,
    wastageBasis = 'ingredients',
    yieldCount = 1,
    yieldUnit = 'biscuits'
  } = productionData;

  const count = Math.max(1, Number(yieldCount) || 1);

  const handleChange = (field, val) => {
    onChange({
      ...productionData,
      [field]: val
    });
  };

  const directSubtotal = Number(ingredientCost) + 
    Number(packagingCost || 0) + 
    Number(labourCost || 0) + 
    Number(utilitiesCost || 0) + 
    Number(transportCost || 0) + 
    Number(otherExpenses || 0);

  const rawWastage = wastageBasis === 'total'
    ? directSubtotal * ((Number(wastagePercentage) || 0) / 100)
    : Number(ingredientCost) * ((Number(wastagePercentage) || 0) / 100);

  const wastageCost = Math.round((rawWastage + Number.EPSILON) * 100) / 100;
  const totalProductionCost = Math.round((directSubtotal + wastageCost + Number.EPSILON) * 100) / 100;
  const costPerProduct = totalProductionCost / count;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <span>Production Overheads & Wastage</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add packaging, labour, energy, and configure wastage to find true production cost
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">Batch Total • {count} {yieldUnit}</span>
          <p className="text-xl font-extrabold text-amber-700">{formatINR(totalProductionCost)}</p>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
            {formatINR(costPerProduct)} per {yieldUnit.replace(/s$/, '') || 'piece'}
          </span>
        </div>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Packaging */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>Packaging Cost (₹)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
            <input
              type="number"
              min="0"
              step="any"
              value={packagingCost === 0 ? '' : packagingCost}
              placeholder="0.00"
              onChange={(e) => handleChange('packagingCost', Number(e.target.value) || 0)}
              className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Boxes, wraps, ribbons, labels</span>
        </div>

        {/* Labour */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Labour & Prep (₹)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
            <input
              type="number"
              min="0"
              step="any"
              value={labourCost === 0 ? '' : labourCost}
              placeholder="0.00"
              onChange={(e) => handleChange('labourCost', Number(e.target.value) || 0)}
              className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Chef & helper batch time</span>
        </div>

        {/* Electricity & Gas */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-slate-500" />
            <span>Electricity & Gas (₹)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
            <input
              type="number"
              min="0"
              step="any"
              value={utilitiesCost === 0 ? '' : utilitiesCost}
              placeholder="0.00"
              onChange={(e) => handleChange('utilitiesCost', Number(e.target.value) || 0)}
              className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Oven, mixer, cooling</span>
        </div>

        {/* Transport */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-500" />
            <span>Transportation (₹)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
            <input
              type="number"
              min="0"
              step="any"
              value={transportCost === 0 ? '' : transportCost}
              placeholder="0.00"
              onChange={(e) => handleChange('transportCost', Number(e.target.value) || 0)}
              className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ingredient logistics & delivery</span>
        </div>

        {/* Other Miscellaneous */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
            <span>Other Expenses (₹)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
            <input
              type="number"
              min="0"
              step="any"
              value={otherExpenses === 0 ? '' : otherExpenses}
              placeholder="0.00"
              onChange={(e) => handleChange('otherExpenses', Number(e.target.value) || 0)}
              className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Cleaning, parchment, misc</span>
        </div>

        {/* Wastage Percentage */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Wastage (%)</span>
            </span>
            <span className="text-amber-800 font-bold">{formatINR(wastageCost)}</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={wastagePercentage === 0 ? '' : wastagePercentage}
              placeholder="0.0"
              onChange={(e) => handleChange('wastagePercentage', Number(e.target.value) || 0)}
              className="w-full pr-8 pl-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Trimmings, dough residue, breakage</span>
        </div>

        {/* Batch Yield Count */}
        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
          <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              <span>Total Yield ({yieldUnit || 'units'})</span>
            </span>
            <span className="text-[11px] text-amber-900 font-extrabold">{count} pcs</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              value={yieldCount === 0 ? '' : yieldCount}
              placeholder="50"
              onChange={(e) => handleChange('yieldCount', Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg border-2 border-amber-300 text-sm font-black text-amber-950 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <span className="text-[11px] text-amber-900/80 mt-1 block font-medium">Divides total cost to get per-unit price</span>
        </div>
      </div>

      {/* Wastage Configuration Toggle (Ensures not counted twice) */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-800">Wastage Calculation Basis</p>
            <p className="text-[11px] text-slate-500">
              Apply wastage strictly to raw ingredients or full production subtotal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => handleChange('wastageBasis', 'ingredients')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              wastageBasis === 'ingredients'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Raw Ingredients Only (Recommended)
          </button>
          <button
            type="button"
            onClick={() => handleChange('wastageBasis', 'total')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              wastageBasis === 'total'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Full Subtotal
          </button>
        </div>
      </div>

      {/* Summary Formula Strip */}
      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-slate-700 flex flex-wrap items-center gap-2">
        <span className="font-bold text-amber-900">Total Production Cost</span>
        <span>=</span>
        <span>Ingredients ({formatINR(ingredientCost)})</span>
        <span>+</span>
        <span>Packaging ({formatINR(packagingCost)})</span>
        <span>+</span>
        <span>Labour ({formatINR(labourCost)})</span>
        <span>+</span>
        <span>Utilities ({formatINR(utilitiesCost)})</span>
        <span>+</span>
        <span>Transport ({formatINR(transportCost)})</span>
        <span>+</span>
        <span>Other ({formatINR(otherExpenses)})</span>
        <span>+</span>
        <span>Wastage ({formatINR(wastageCost)})</span>
        <span className="font-extrabold text-amber-900 ml-auto">= {formatINR(totalProductionCost)}</span>
      </div>
    </div>
  );
}
