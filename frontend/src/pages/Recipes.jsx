import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  Calculator, 
  ArrowRight, 
  FileSpreadsheet, 
  FileText,
  Percent,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.js';
import RecipeModal from '../components/RecipeModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { exportRecipeToPdf } from '../utils/exportPdf.js';
import { exportRecipeToExcel, exportAllRecipesSummaryToExcel } from '../utils/exportExcel.js';
import { formatINR } from '../utils/formatters.js';

export default function Recipes({ onOpenRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(recipes.map(r => r.category))];

  const filteredRecipes = recipes.filter(r => {
    const matchesCat = selectedCategory === 'All' || r.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !search || 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const copy = await api.duplicateRecipe(id);
      loadData();
      if (copy && copy.id) {
        onOpenRecipe(copy.id);
      }
    } catch (err) {
      alert('Failed to duplicate recipe: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteRecipe(deletingId);
      setDeletingId(null);
      loadData();
    } catch (err) {
      alert('Failed to delete recipe: ' + err.message);
    }
  };

  const handleCreateRecipe = async (formData) => {
    try {
      const newRec = await api.createRecipe(formData);
      setModalOpen(false);
      loadData();
      if (newRec && newRec.id) {
        onOpenRecipe(newRec.id);
      }
    } catch (err) {
      alert('Error creating recipe: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-amber-600" />
            <span>Recipe Management & Catalog</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse formulations, batch yields, unit production costs, and target retail pricing
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportAllRecipesSummaryToExcel(recipes)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Summary</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Recipe</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search recipes by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Loading recipe formulations...
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No recipes found</h3>
          <p className="text-xs text-slate-500 mt-1">Try a different search query or create a new recipe.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((r) => {
            const prod = r.productionCost || {};
            const profit = r.profitAnalysis || {};
            const isSample = r.id === 'rec-1';

            return (
              <div
                key={r.id}
                onClick={() => onOpenRecipe(r.id)}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex flex-col overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {r.category}
                        </span>
                        {isSample && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            ★ Exact Spec
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-amber-800 transition-colors">
                        {r.name}
                      </h3>
                    </div>

                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      {profit.profitMarginPercentage}% Margin
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {r.description || 'Standard bakery production batch formulation.'}
                  </p>

                  {/* Batch Yield */}
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <span className="font-medium">Batch Yield:</span>
                    <span className="font-bold text-slate-900">
                      {r.yieldCount} {r.yieldUnit}
                    </span>
                  </div>

                  {/* Costing Matrix */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Raw Ingredients
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        {formatINR(r.totalIngredientCost)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Total Batch Cost
                      </span>
                      <span className="font-bold text-amber-900 text-sm">
                        {formatINR(prod.totalProductionCost)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Cost / Unit
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatINR(prod.costPerProduct)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                        Selling Price
                      </span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {formatINR(profit.suggestedSellingPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDuplicate(r.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-800 hover:bg-slate-200 transition-colors"
                      title="Duplicate Recipe"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportRecipeToPdf(r);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-slate-200 transition-colors"
                      title="Export PDF Costing Sheet"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportRecipeToExcel(r);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-200 transition-colors"
                      title="Export Excel Sheet"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>
                    {!isSample && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(r.id);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-200 transition-colors"
                        title="Delete Recipe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="font-bold text-amber-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Calculate Cost</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <RecipeModal
        isOpen={modalOpen}
        availableIngredients={ingredients}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateRecipe}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? All calculated batch production history will be removed."
        confirmText="Delete Recipe"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
}
