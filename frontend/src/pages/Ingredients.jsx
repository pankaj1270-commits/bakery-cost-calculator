import React, { useState, useEffect } from 'react';
import { 
  Wheat, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  History, 
  Download,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api.js';
import IngredientModal from '../components/IngredientModal.jsx';
import PriceHistoryModal from '../components/PriceHistoryModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { exportIngredientsToExcel } from '../utils/exportExcel.js';
import { formatINR, formatDate } from '../utils/formatters.js';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyIngredient, setHistoryIngredient] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorToast, setErrorToast] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ingList, histList] = await Promise.all([
        api.getIngredients(),
        api.getPriceHistory()
      ]);
      setIngredients(ingList);
      setHistory(histList);
    } catch (err) {
      console.error('Failed to load ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(ingredients.map(i => i.category))];

  const filteredIngredients = ingredients.filter(i => {
    const matchesCat = selectedCategory === 'All' || i.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !search || 
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.supplierName && i.supplierName.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSave = async (formData) => {
    try {
      if (editingIngredient) {
        await api.updateIngredient(editingIngredient.id, formData);
      } else {
        await api.createIngredient(formData);
      }
      setModalOpen(false);
      setEditingIngredient(null);
      loadData();
    } catch (err) {
      setErrorToast(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteIngredient(deletingId);
      setDeletingId(null);
      loadData();
    } catch (err) {
      setErrorToast(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert if any */}
      {errorToast && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button 
            onClick={() => setErrorToast('')}
            className="text-xs font-bold text-rose-700 hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wheat className="w-7 h-7 text-amber-600" />
            <span>Ingredient Master</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage ingredient procurement pack sizes, unit rates, and price histories
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportIngredientsToExcel(ingredients)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              setEditingIngredient(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ingredient</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search ingredients by name or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500"
          />
        </div>

        {/* Category Pills */}
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

      {/* Ingredients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Ingredient Name</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Purchase Package & Price</th>
                <th className="px-4 py-3.5">Cost / Base Unit</th>
                <th className="px-4 py-3.5">Supplier</th>
                <th className="px-4 py-3.5">Last Purchased</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    Loading ingredient catalog...
                  </td>
                </tr>
              ) : filteredIngredients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    No ingredients found matching your search.
                  </td>
                </tr>
              ) : (
                filteredIngredients.map((ing) => (
                  <tr key={ing.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                      {ing.name}
                      {ing.notes && (
                        <span className="block text-[11px] font-normal text-slate-400">
                          {ing.notes}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {ing.category}
                      </span>
                    </td>

                    {/* Purchase Package */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800">
                        {formatINR(ing.purchasePrice)}
                      </span>
                      <span className="text-slate-500 text-[11px] block">
                        per {ing.purchaseQuantity} {ing.purchaseUnit}
                      </span>
                    </td>

                    {/* Base Cost */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-extrabold text-amber-900 bg-amber-100 border border-amber-300">
                        {formatINR(ing.costPerBaseUnit, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} / {ing.baseUnit}
                      </span>
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {ing.supplierName || '—'}
                    </td>

                    {/* Last Date */}
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(ing.lastPurchaseDate)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setHistoryIngredient(ing);
                            setHistoryModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="View price history"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingIngredient(ing);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit ingredient"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(ing.id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <IngredientModal
        isOpen={modalOpen}
        ingredient={editingIngredient}
        onClose={() => {
          setModalOpen(false);
          setEditingIngredient(null);
        }}
        onSave={handleSave}
      />

      <PriceHistoryModal
        isOpen={historyModalOpen}
        ingredient={historyIngredient}
        history={history}
        onClose={() => {
          setHistoryModalOpen(false);
          setHistoryIngredient(null);
        }}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Ingredient"
        message="Are you sure you want to delete this ingredient? If it is used in active recipes, deletion will be blocked."
        confirmText="Delete Ingredient"
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
