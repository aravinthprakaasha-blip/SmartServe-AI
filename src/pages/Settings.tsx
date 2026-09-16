import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  Building,
  Clock,
  Sliders,
  Bell,
  CloudSun,
  Calendar,
  DollarSign,
  Shield,
  RotateCcw,
  Percent,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { RestaurantSettings } from '../types';
import { AIInsight } from '../components/common/AIInsight';

export const Settings: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useAppContext();

  const [formState, setFormState] = useState<RestaurantSettings>({
    ...settings,
    openingTime: settings.openingTime || '07:00 AM',
    closingTime: settings.closingTime || '11:00 PM',
    lowStockAlertThresholdPercent: settings.lowStockAlertThresholdPercent ?? 20,
    currencySymbol: settings.currencySymbol || '₹',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all restaurant configuration parameters to defaults?')) {
      resetToDefaults();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Restaurant System Settings
            </h1>
            <span className="p-1 rounded-full bg-slate-100 text-slate-700">
              <SettingsIcon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure restaurant identity, operating hours, meal shifts, safety buffers, and threshold alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully! Configuration updated across all forecasting modules.</span>
        </div>
      )}

      {/* AI Insight */}
      <AIInsight
        title="Predictive Guardrail Calibration"
        message="Default Safety Buffer is set to 8.0% to balance stockout prevention against waste. Low stock notifications trigger automatically when ingredient inventory drops below the 20% safety threshold."
        type="action"
        impactBadge="Active Dynamic Protection"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Requirement 16: Restaurant Name, Opening & Closing Hours */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>Restaurant Configuration</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                required
                value={formState.restaurantName}
                onChange={e => setFormState({ ...formState, restaurantName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Opening Hour
              </label>
              <input
                type="text"
                required
                value={formState.openingTime}
                onChange={e => setFormState({ ...formState, openingTime: e.target.value })}
                placeholder="e.g. 07:00 AM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Closing Hour
              </label>
              <input
                type="text"
                required
                value={formState.closingTime}
                onChange={e => setFormState({ ...formState, closingTime: e.target.value })}
                placeholder="e.g. 11:00 PM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Requirement 16: Meal Period Times (Breakfast, Lunch, Dinner) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Meal Period Times</span>
          </h2>
          <p className="text-xs text-slate-500">
            Define kitchen shift windows for production batch scheduling and demand aggregation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Breakfast Start/End */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <span className="text-xs font-bold text-indigo-900">Breakfast</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Start Time</span>
                  <input
                    type="text"
                    value={formState.mealPeriods.Morning.start}
                    onChange={e =>
                      setFormState({
                        ...formState,
                        mealPeriods: {
                          ...formState.mealPeriods,
                          Morning: { ...formState.mealPeriods.Morning, start: e.target.value },
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">End Time</span>
                  <input
                    type="text"
                    value={formState.mealPeriods.Morning.end}
                    onChange={e =>
                      setFormState({
                        ...formState,
                        mealPeriods: {
                          ...formState.mealPeriods,
                          Morning: { ...formState.mealPeriods.Morning, end: e.target.value },
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Lunch Start/End */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <span className="text-xs font-bold text-indigo-900">Lunch</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Start Time</span>
                  <input
                    type="text"
                    value={formState.mealPeriods.Lunch.start}
                    onChange={e =>
                      setFormState({
                        ...formState,
                        mealPeriods: {
                          ...formState.mealPeriods,
                          Lunch: { ...formState.mealPeriods.Lunch, start: e.target.value },
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">End Time</span>
                  <input
                    type="text"
                    value={formState.mealPeriods.Lunch.end}
                    onChange={e =>
                      setFormState({
                        ...formState,
                        mealPeriods: {
                          ...formState.mealPeriods,
                          Lunch: { ...formState.mealPeriods.Lunch, end: e.target.value },
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Dinner Start/End */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <span className="text-xs font-bold text-indigo-900">Dinner</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">Start Time</span>
                  <input
                    type="text"
                    value={formState.mealPeriods.Dinner.start}
                    onChange={e =>
                      setFormState({
                        ...formState,
                        mealPeriods: {
                          ...formState.mealPeriods,
                          Dinner: { ...formState.mealPeriods.Dinner, start: e.target.value },
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">End Time</span>
                  <input
                    type="text"
                    value={formState.mealPeriods.Dinner.end}
                    onChange={e =>
                      setFormState({
                        ...formState,
                        mealPeriods: {
                          ...formState.mealPeriods,
                          Dinner: { ...formState.mealPeriods.Dinner, end: e.target.value },
                        },
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirement 16: Safety Buffer %, Low Stock Alert Threshold %, Currency Symbol */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>AI Buffers &amp; Thresholds</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Safety Buffer Percentage (%) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Safety Buffer Percentage (%)</span>
                <span className="text-indigo-600 text-sm font-extrabold">
                  {formState.defaultSafetyBufferPercent}%
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={25}
                step={1}
                value={formState.defaultSafetyBufferPercent}
                onChange={e =>
                  setFormState({
                    ...formState,
                    defaultSafetyBufferPercent: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Buffer added on top of predicted plate demand to prevent stockouts.
              </p>
            </div>

            {/* Low Stock Alert Threshold (%) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Low Stock Alert Threshold (%)</span>
                <span className="text-rose-600 text-sm font-extrabold">
                  {formState.lowStockAlertThresholdPercent}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={formState.lowStockAlertThresholdPercent}
                onChange={e =>
                  setFormState({
                    ...formState,
                    lowStockAlertThresholdPercent: Number(e.target.value),
                  })
                }
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Triggers visual warning when stock falls below % of minimum inventory.
              </p>
            </div>

            {/* Currency Symbol (₹ default) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Currency Symbol
              </label>
              <select
                value={formState.currencySymbol}
                onChange={e =>
                  setFormState({
                    ...formState,
                    currencySymbol: e.target.value,
                    currency: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                <option value="₹">₹ (Indian Rupee - Default)</option>
                <option value="$">$ (US Dollar)</option>
                <option value="€">€ (Euro)</option>
                <option value="£">£ (British Pound)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Active symbol displayed across all operational and purchasing tables.
              </p>
            </div>
          </div>
        </div>

        {/* Save Settings button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
