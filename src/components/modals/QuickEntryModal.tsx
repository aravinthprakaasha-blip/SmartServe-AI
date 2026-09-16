import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { MealPeriod } from '../../types';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { dishes, addSalesRecord } = useAppContext();

  // Determine current meal period from hour
  const currentHour = new Date().getHours();
  let defaultMeal: MealPeriod = 'Lunch';
  if (currentHour < 11) defaultMeal = 'Morning';
  else if (currentHour >= 11 && currentHour < 16) defaultMeal = 'Lunch';
  else if (currentHour >= 16 && currentHour < 19) defaultMeal = 'Evening';
  else defaultMeal = 'Dinner';

  const [selectedDishId, setSelectedDishId] = useState<string>(dishes[0]?.id || 'dish-1');
  const [prepared, setPrepared] = useState<number>(200);
  const [sold, setSold] = useState<number>(145);
  const [wasted, setWasted] = useState<number>(12);
  const [mealPeriod, setMealPeriod] = useState<MealPeriod>(defaultMeal);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedDish = dishes.find(d => d.id === selectedDishId) || dishes[0];
  const remaining = Math.max(0, prepared - sold - wasted);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDish) {
      setErrorMessage('Please select a dish');
      return;
    }

    if (sold > prepared) {
      setErrorMessage(`Quantity sold (${sold}) cannot exceed quantity prepared (${prepared})`);
      return;
    }

    if (sold + wasted > prepared) {
      setErrorMessage(`Total sold (${sold}) + wasted (${wasted}) exceeds total prepared (${prepared})`);
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];

    const deductions = addSalesRecord({
      date: todayStr,
      time: timeStr,
      dishId: selectedDish.id,
      dishName: selectedDish.name,
      quantityPrepared: Number(prepared),
      quantitySold: Number(sold),
      quantityRemaining: remaining,
      quantityWasted: Number(wasted),
      mealPeriod,
      sellingPrice: selectedDish.priceINR,
      isDemo: false,
    });

    const deductionSummary = deductions.length > 0
      ? `Deducted: ${deductions.map(d => `${d.usedAmount}${d.unit} ${d.ingredientName}`).slice(0, 2).join(', ')}`
      : 'Inventory & live forecast recalculated';

    if (onSuccessToast) {
      onSuccessToast(`Live record saved: ${sold} ${selectedDish.name} sold. ${deductionSummary}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Quick Data Entry</h3>
              <p className="text-xs text-slate-500">Record actual meal service figures instantly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dish Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Dish / Menu Item
            </label>
            <select
              value={selectedDishId}
              onChange={e => setSelectedDishId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {dishes.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.category}) — ₹{d.priceINR}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Period */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Meal Period
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Morning', 'Lunch', 'Evening', 'Dinner'] as MealPeriod[]).map(period => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setMealPeriod(period)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    mealPeriod === period
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {period === 'Morning' ? 'Breakfast' : period}
                </button>
              ))}
            </div>
          </div>

          {/* Prepared, Sold, Waste */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prepared
              </label>
              <input
                type="number"
                min="0"
                value={prepared}
                onChange={e => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setPrepared(val);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                required
              />
              <span className="text-[10px] text-slate-400">Total batch</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sold
              </label>
              <input
                type="number"
                min="0"
                value={sold}
                onChange={e => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setSold(val);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-indigo-300 bg-indigo-50/30 text-indigo-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                required
              />
              <span className="text-[10px] text-slate-400">Actual billing</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waste
              </label>
              <input
                type="number"
                min="0"
                value={wasted}
                onChange={e => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setWasted(val);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-rose-600 focus:ring-2 focus:ring-indigo-500"
                required
              />
              <span className="text-[10px] text-slate-400">Discarded</span>
            </div>
          </div>

          {/* Auto Computed Remaining & Revenue Preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-600">
            <div>
              <span className="text-slate-400">Remaining Balance: </span>
              <span className="font-bold text-slate-800">{remaining} plates</span>
            </div>
            <div>
              <span className="text-slate-400">Revenue: </span>
              <span className="font-bold text-emerald-600">₹{(sold * (selectedDish?.priceINR || 0)).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Update Dashboard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
