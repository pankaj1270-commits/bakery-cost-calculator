import React from 'react';
import { X, History, TrendingUp, Calendar, Tag } from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters.js';

export default function PriceHistoryModal({ isOpen, onClose, ingredient, history = [] }) {
  if (!isOpen || !ingredient) return null;

  const records = history.filter(h => h.ingredientId === ingredient.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Price History: {ingredient.name}
              </h3>
              <p className="text-xs text-slate-500">
                Historical purchase costs & revision audit trail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-800 font-semibold uppercase">Current Active Rate</span>
              <p className="text-base font-bold text-slate-900">
                {formatINR(ingredient.purchasePrice)} per {ingredient.purchaseQuantity} {ingredient.purchaseUnit}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Standard Cost</span>
              <p className="text-sm font-bold text-amber-900">
                {formatINR(ingredient.costPerBaseUnit, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} / {ingredient.baseUnit}
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {records.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No previous price changes recorded yet.
              </div>
            ) : (
              records.map((rec, idx) => (
                <div
                  key={rec.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(rec.effectiveDate)}</span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm">
                      {formatINR(rec.purchasePrice)} / {rec.purchaseQuantity} {rec.purchaseUnit}
                    </p>
                    {rec.reason && (
                      <p className="text-slate-500 italic flex items-center gap-1">
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>{rec.reason}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 text-slate-700">
                      {formatINR(rec.costPerBaseUnit, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} / {ingredient.baseUnit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
