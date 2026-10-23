import React from 'react';
import { 
  TrendingUp, 
  HelpCircle, 
  Percent, 
  Coins, 
  Target, 
  Award,
  Sparkles
} from 'lucide-react';
import { calculateSellingPriceAndProfit } from '../utils/calculations.js';
import { formatINR } from '../utils/formatters.js';

export default function PricingCalculatorCard({
  costPerProduct = 0,
  yieldCount = 1,
  yieldUnit = 'pieces',
  pricingData,
  onChange
}) {
  const {
    pricingStrategy = 'margin', // 'margin' or 'markup'
    targetPercentage = 30
  } = pricingData;

  const results = calculateSellingPriceAndProfit({
    costPerProduct,
    yieldCount,
    pricingStrategy,
    targetPercentage
  });

  const handleStrategyChange = (strategy) => {
    onChange({
      ...pricingData,
      pricingStrategy: strategy
    });
  };

  const handlePercentageChange = (pct) => {
    onChange({
      ...pricingData,
      targetPercentage: Number(pct)
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span>Selling Price & Profit Margin Calculator</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Determine profitable retail and wholesale pricing per finished item
          </p>
        </div>

        {/* Strategy Selector Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleStrategyChange('margin')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              pricingStrategy === 'margin'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profit Margin %
          </button>
          <button
            type="button"
            onClick={() => handleStrategyChange('markup')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              pricingStrategy === 'markup'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cost Markup %
          </button>
        </div>
      </div>

      {/* Target Percentage Control */}
      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Target {pricingStrategy === 'margin' ? 'Profit Margin' : 'Markup'} Percentage</span>
          </label>
          <span className="text-lg font-extrabold text-emerald-800">
            {targetPercentage}%
          </span>
        </div>

        {/* Slider & Number Input */}
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max={pricingStrategy === 'margin' ? '85' : '150'}
            step="1"
            value={targetPercentage}
            onChange={(e) => handlePercentageChange(e.target.value)}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="relative w-24 shrink-0">
            <input
              type="number"
              min="0"
              max={pricingStrategy === 'margin' ? '99' : '1000'}
              step="any"
              value={targetPercentage}
              onChange={(e) => handlePercentageChange(e.target.value)}
              className="w-full pl-3 pr-7 py-1.5 rounded-lg border border-emerald-300 text-sm font-bold text-emerald-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <span className="absolute right-2.5 top-1.5 text-xs font-bold text-emerald-600">%</span>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium text-[11px]">Popular Presets:</span>
          {[20, 25, 30, 35, 40, 50].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePercentageChange(preset)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                targetPercentage === preset
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Cost Per {yieldUnit.replace(/s$/, '') || 'Product'}
          </span>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {formatINR(costPerProduct)}
          </p>
          <span className="text-[10px] text-slate-400">Total batch cost / {yieldCount}</span>
        </div>

        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 ring-2 ring-emerald-400/30">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Suggested Price / {yieldUnit.replace(/s$/, '') || 'Unit'}
          </span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">
            {formatINR(results.suggestedSellingPrice)}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Recommended retail</span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Profit Per {yieldUnit.replace(/s$/, '') || 'Unit'}
          </span>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            +{formatINR(results.profitPerProduct)}
          </p>
          <span className="text-[10px] text-slate-400">
            {results.profitMarginPercentage}% margin
          </span>
        </div>

        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
            Batch Total Profit
          </span>
          <p className="text-xl font-extrabold text-amber-800 mt-1">
            +{formatINR(results.totalProfitPerBatch)}
          </p>
          <span className="text-[10px] text-amber-700 font-medium">
            Revenue: {formatINR(results.totalBatchRevenue)}
          </span>
        </div>
      </div>

      {/* Educational Formula Explanation Box (Distinguishes Margin vs Markup) */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Understanding the Pricing Mathematics:</span>
        </div>

        {pricingStrategy === 'margin' ? (
          <div className="space-y-1.5 text-slate-600">
            <p>
              <strong className="text-slate-800">Profit Margin Formula:</strong>{' '}
              <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-emerald-800 font-bold">
                Selling Price = Cost ÷ (1 − Margin%)
              </code>
            </p>
            <p className="text-slate-500">
              Calculation:{' '}
              {formatINR(costPerProduct)} ÷ (1 − {targetPercentage / 100}) ={' '}
              <strong className="text-emerald-700">{formatINR(results.suggestedSellingPrice)}</strong>.
              {' '}This guarantees that exactly {targetPercentage}% of the revenue collected from customers is retained as pure profit.
            </p>
            <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-lg border border-amber-200">
              💡 Example: For a biscuit costing ₹5 with a 30% desired margin, the selling price is ₹5 ÷ 0.70 = ₹7.14 (Profit: ₹2.14).
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 text-slate-600">
            <p>
              <strong className="text-slate-800">Markup Formula:</strong>{' '}
              <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-emerald-800 font-bold">
                Selling Price = Cost × (1 + Markup%)
              </code>
            </p>
            <p className="text-slate-500">
              Calculation:{' '}
              {formatINR(costPerProduct)} × (1 + {targetPercentage / 100}) ={' '}
              <strong className="text-emerald-700">{formatINR(results.suggestedSellingPrice)}</strong>.
              {' '}This yields an effective profit margin of {results.profitMarginPercentage}%.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
