import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Info, Calculator } from 'lucide-react';
import { COMMON_UNITS, calculateBaseCost } from '../utils/unitConverter.js';
import { formatINR } from '../utils/formatters.js';

const CATEGORIES = [
  'Dairy',
  'Grains & Flour',
  'Sweeteners',
  'Chocolates & Cocoa',
  'Leavening Agents',
  'Flavourings & Colours',
  'Dairy & Eggs',
  'Nuts & Seeds',
  'Fats & Oils',
  'Packaging Supplies',
  'General'
];

export default function IngredientModal({ isOpen, onClose, onSave, ingredient }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains & Flour',
    purchaseQuantity: '',
    purchaseUnit: 'kg',
    purchasePrice: '',
    supplierName: '',
    lastPurchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
    priceChangeReason: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || '',
        category: ingredient.category || 'General',
        purchaseQuantity: ingredient.purchaseQuantity || '',
        purchaseUnit: ingredient.purchaseUnit || 'kg',
        purchasePrice: ingredient.purchasePrice ?? '',
        supplierName: ingredient.supplierName || '',
        lastPurchaseDate: ingredient.lastPurchaseDate || new Date().toISOString().split('T')[0],
        notes: ingredient.notes || '',
        priceChangeReason: ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Grains & Flour',
        purchaseQuantity: 1,
        purchaseUnit: 'kg',
        purchasePrice: '',
        supplierName: '',
        lastPurchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
        priceChangeReason: ''
      });
    }
    setErrors({});
  }, [ingredient, isOpen]);

  if (!isOpen) return null;

  // Real-time calculation of unit cost as user types
  const { costPerBaseUnit, baseUnit } = calculateBaseCost(
    formData.purchaseQuantity,
    formData.purchaseUnit,
    formData.purchasePrice
  );

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Ingredient name is required';
    if (!formData.purchaseQuantity || Number(formData.purchaseQuantity) <= 0) {
      errs.purchaseQuantity = 'Quantity must be greater than 0';
    }
    if (formData.purchasePrice === '' || Number(formData.purchasePrice) < 0) {
      errs.purchasePrice = 'Purchase price cannot be negative';
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}
            </h3>
            <p className="text-xs text-slate-500">
              Specify procurement packaging and purchase rate
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
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ingredient Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Butter, Baking Soda, Maida (Flour)"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Last Purchase Date
              </label>
              <input
                type="date"
                value={formData.lastPurchaseDate}
                onChange={(e) => setFormData({ ...formData, lastPurchaseDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Purchase Package & Rate */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-amber-600" />
              <span>Purchase Rate & Package Sizing</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Purchase Qty *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  placeholder="e.g. 1"
                  value={formData.purchaseQuantity}
                  onChange={(e) => setFormData({ ...formData, purchaseQuantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Purchase Unit *
                </label>
                <select
                  value={formData.purchaseUnit}
                  onChange={(e) => setFormData({ ...formData, purchaseUnit: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Price (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="700"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Calculated Cost Preview */}
            <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Standard Unit Cost:</span>
              <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                {formatINR(costPerBaseUnit, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} / {baseUnit}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Example: 1 kg @ ₹700 = ₹0.70/g. 100 g @ ₹30 = ₹0.30/g.
            </p>
          </div>

          {/* Supplier & Price Change Reason */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supplier / Vendor (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Amul Wholesale, Local Market"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>

            {ingredient && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Price Update (Saved to History)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Supplier revised price, Seasonal increase"
                  value={formData.priceChangeReason}
                  onChange={(e) => setFormData({ ...formData, priceChangeReason: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Notes
              </label>
              <textarea
                rows="2"
                placeholder="Optional notes or specifications"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
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
              {ingredient ? 'Save Changes' : 'Add Ingredient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
