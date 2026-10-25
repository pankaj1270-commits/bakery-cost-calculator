import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Info, AlertCircle } from 'lucide-react';
import { COMMON_UNITS, calculateIngredientCostInRecipe } from '../utils/unitConverter.js';
import { formatINR } from '../utils/formatters.js';

const RECIPE_CATEGORIES = [
  'Biscuits & Cookies',
  'Cakes & Pastries',
  'Breads',
  'Cupcakes & Muffins',
  'Puffs & Savouries',
  'Chocolates & Confectionery',
  'Custom Bakery'
];

export default function RecipeModal({
  isOpen,
  onClose,
  onSave,
  recipe,
  availableIngredients = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Biscuits & Cookies',
    description: '',
    yieldCount: 50,
    yieldUnit: 'biscuits',
    items: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        category: recipe.category || 'Biscuits & Cookies',
        description: recipe.description || '',
        yieldCount: recipe.yieldCount || 1,
        yieldUnit: recipe.yieldUnit || 'pieces',
        items: (recipe.items || []).map(it => ({
          ingredientId: it.ingredientId,
          quantity: it.quantity,
          unit: it.unit
        }))
      });
    } else {
      setFormData({
        name: '',
        category: 'Biscuits & Cookies',
        description: '',
        yieldCount: 50,
        yieldUnit: 'biscuits',
        items: availableIngredients.slice(0, 3).map(ing => ({
          ingredientId: ing.id,
          quantity: 100,
          unit: ing.baseUnit || 'g'
        }))
      });
    }
    setErrors({});
  }, [recipe, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (availableIngredients.length === 0) return;
    const first = availableIngredients[0];
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          ingredientId: first.id,
          name: first.name,
          quantity: 100,
          unit: first.baseUnit || 'g',
          snapshotPurchaseQty: first.purchaseQuantity || 1,
          snapshotPurchaseUnit: first.purchaseUnit || 'g',
          snapshotPurchasePrice: first.purchasePrice || 0,
          snapshotCostPerBaseUnit: first.costPerBaseUnit || 0
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    const next = [...formData.items];
    next.splice(index, 1);
    setFormData({ ...formData, items: next });
  };

  const handleItemChange = (index, field, val) => {
    const next = [...formData.items];
    if (field === 'ingredientId') {
      const selectedIng = ingMap.get(val) || availableIngredients.find(i => i.id === val);
      next[index] = {
        ...next[index],
        ingredientId: val,
        name: selectedIng ? selectedIng.name : next[index].name,
        unit: selectedIng ? selectedIng.baseUnit || 'g' : (next[index].unit || 'g'),
        snapshotPurchaseQty: selectedIng ? selectedIng.purchaseQuantity : 1,
        snapshotPurchaseUnit: selectedIng ? selectedIng.purchaseUnit : 'g',
        snapshotPurchasePrice: selectedIng ? selectedIng.purchasePrice : 0,
        snapshotCostPerBaseUnit: selectedIng ? selectedIng.costPerBaseUnit : 0
      };
    } else {
      next[index] = { ...next[index], [field]: val };
    }
    setFormData({ ...formData, items: next });
  };

  // Compute live estimated ingredient total
  const ingMap = new Map(availableIngredients.map(i => [i.id, i]));
  let estimatedIngredientTotal = 0;

  const evaluatedItems = formData.items.map(it => {
    const ing = ingMap.get(it.ingredientId);
    let cost = 0;
    if (ing) {
      cost = calculateIngredientCostInRecipe({
        recipeQuantity: it.quantity,
        recipeUnit: it.unit,
        purchaseQuantity: ing.purchaseQuantity,
        purchaseUnit: ing.purchaseUnit,
        purchasePrice: ing.purchasePrice
      });
    }
    estimatedIngredientTotal += cost;
    return { ...it, cost };
  });

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Recipe name is required';
    if (!formData.yieldCount || Number(formData.yieldCount) <= 0) {
      errs.yieldCount = 'Batch yield must be at least 1';
    }
    if (formData.items.length === 0) {
      errs.items = 'Please add at least one ingredient';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {recipe ? 'Edit Recipe' : 'Create New Recipe'}
            </h3>
            <p className="text-xs text-slate-500">
              Configure recipe details, batch yield, and ingredient formulation
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Recipe Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Recipe Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Butter Biscuits, Chocolate Chip Cookies"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                    : 'border-slate-300 focus:ring-amber-200 focus:border-amber-500'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white"
              >
                {RECIPE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Batch Yield *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="50"
                  value={formData.yieldCount}
                  onChange={(e) => setFormData({ ...formData, yieldCount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Unit Name
                </label>
                <input
                  type="text"
                  placeholder="biscuits, cakes"
                  value={formData.yieldUnit}
                  onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Baking Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Crisp golden tea time biscuits baked at 170°C for 18 mins"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          {/* Ingredients Formulation Table */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Recipe Ingredients
                </h4>
                <p className="text-[11px] text-slate-500">Pick raw materials and exact batch weights</p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            {errors.items && (
              <p className="text-xs text-rose-500 mb-2">{errors.items}</p>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {evaluatedItems.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3 text-xs"
                  >
                    {/* Ingredient Select */}
                    <div className="w-full sm:flex-1">
                      <select
                        value={item.ingredientId}
                        onChange={(e) => handleItemChange(idx, 'ingredientId', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      >
                        {availableIngredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({formatINR(ing.purchasePrice)} / {ing.purchaseQuantity} {ing.purchaseUnit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity & Unit */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        step="any"
                        min="0.001"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-right font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      />

                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
                      >
                        {COMMON_UNITS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Calculated Cost Pill */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-28 shrink-0">
                      <span className="font-extrabold text-amber-900 bg-amber-100/70 px-2 py-1 rounded-md border border-amber-200 text-right">
                        {formatINR(item.cost)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove ingredient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Ingredient Cost Preview */}
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-900">Total Raw Ingredient Cost:</span>
              <span className="text-base font-extrabold text-amber-900">
                {formatINR(estimatedIngredientTotal)}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md shadow-amber-500/25 transition-all"
            >
              {recipe ? 'Save Changes' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
