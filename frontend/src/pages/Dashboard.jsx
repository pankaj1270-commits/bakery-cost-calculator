import React, { useEffect, useState } from 'react';
import { 
  Wheat, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Download, 
  Calendar,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import StatCard from '../components/StatCard.jsx';
import { api } from '../services/api.js';
import { formatINR, formatDate } from '../utils/formatters.js';

export default function Dashboard({ onNavigate, onOpenRecipe }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Chart data: Cost vs Suggested Selling Price
  const chartData = (stats.allRecipesOverview || []).slice(0, 6).map(r => ({
    name: r.name.length > 18 ? r.name.substring(0, 16) + '...' : r.name,
    'Cost Per Unit': Number(r.costPerProduct.toFixed(2)),
    'Selling Price': Number(r.suggestedSellingPrice.toFixed(2)),
    'Profit / Unit': Number(r.profitPerProduct.toFixed(2))
  }));

  const avgMargin = stats.allRecipesOverview.length > 0
    ? (stats.allRecipesOverview.reduce((acc, r) => acc + (r.marginPct || 0), 0) / stats.allRecipesOverview.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bakery Financial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bakery Cost & Margin Dashboard
          </h1>
          <p className="mt-2 text-amber-100 text-sm leading-relaxed">
            Track exact ingredient costs, production overheads, wastage buffers, and enforce optimal profit margins for your baked goods.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenRecipe('rec-1')}
              className="px-4 py-2 rounded-xl bg-white text-amber-900 font-bold text-xs shadow-md hover:bg-amber-50 transition-colors flex items-center gap-1.5"
            >
              <span>Sample Biscuit Recipe (₹660.51)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('ingredients')}
              className="px-4 py-2 rounded-xl bg-amber-800/60 hover:bg-amber-800/80 text-white font-semibold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ingredient</span>
            </button>
            <button
              onClick={() => onNavigate('calculator')}
              className="px-4 py-2 rounded-xl bg-amber-800/60 hover:bg-amber-800/80 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              Open Cost Calculator
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Ingredients"
          value={stats.totalIngredients}
          subtitle="Configured in master catalog"
          icon={Wheat}
          color="amber"
        />
        <StatCard
          title="Active Recipes"
          value={stats.totalRecipes}
          subtitle="Formulations & costing models"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Average Profit Margin"
          value={`${avgMargin}%`}
          subtitle="Across all recipe catalog items"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Sample Biscuit Cost"
          value="₹660.51"
          subtitle="Exact verification benchmark"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Main Chart: Cost vs Selling Price */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Unit Cost vs Suggested Selling Price
            </h3>
            <p className="text-xs text-slate-500">
              Comparison of production cost per unit and recommended selling price with target margin
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
            Indian Rupees (₹)
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                formatter={(val) => [`₹${val}`, '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Cost Per Unit" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Selling Price" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit / Unit" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Top Recipes & Recent Price Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Expensive Recipes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Most Expensive Recipes</h3>
              <p className="text-xs text-slate-500">Ranked by unit production cost</p>
            </div>
            <button
              onClick={() => onNavigate('recipes')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.mostExpensiveRecipes.map((r) => (
              <div 
                key={r.id} 
                onClick={() => onOpenRecipe(r.id)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                  <p className="text-xs text-slate-500">
                    Yield: {r.yieldCount} {r.yieldUnit} | Total Batch: {formatINR(r.productionCost.totalProductionCost)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Cost / Unit</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatINR(r.productionCost.costPerProduct)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Ingredient Price Fluctuations */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Price Changes</h3>
              <p className="text-xs text-slate-500">Ingredient purchase revisions log</p>
            </div>
            <button
              onClick={() => onNavigate('ingredients')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              Manage
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {stats.recentPriceChanges.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">No price updates recorded yet</p>
            ) : (
              stats.recentPriceChanges.map((ph) => (
                <div key={ph.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">
                      {ph.ingredientName}
                    </span>
                    <p className="text-slate-500 mt-0.5">
                      {ph.reason || 'Price adjusted'} • <span className="text-slate-400">{formatDate(ph.effectiveDate)}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-amber-900 block">
                      {formatINR(ph.purchasePrice)} / {ph.purchaseQuantity} {ph.purchaseUnit}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatINR(ph.costPerBaseUnit, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} / g
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
