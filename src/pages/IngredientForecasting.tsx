import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  Scale,
  ChefHat,
  Boxes,
  Calendar,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { predictIngredientRequirement } from '../services/forecastService';
import { IngredientRequirement } from '../types';
import { formatINR } from '../utils';
import { AIInsight } from '../components/common/AIInsight';
import { useNavigate } from 'react-router-dom';

export const IngredientForecasting: React.FC = () => {
  const navigate = useNavigate();
  const { dishes, ingredients } = useAppContext();

  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const requirements = useMemo(() => {
    return predictIngredientRequirement(dishes, ingredients);
  }, [dishes, ingredients]);

  const handleGenerateForecast = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 400);
  };

  const filteredRequirements = useMemo(() => {
    if (selectedCategory === 'shortagesOnly') {
      return requirements.filter(r => r.shortage > 0 || r.recommendedPurchaseQty > 0);
    }
    return requirements;
  }, [requirements, selectedCategory]);

  const totalShortageItems = requirements.filter(r => r.shortage > 0).length;
  const totalRecommendedPurchaseCost = requirements.reduce(
    (sum, r) => sum + r.recommendedPurchaseQty * r.unitCostINR,
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              AI Ingredient Demand Forecasting
            </h1>
            <span className="p-1 rounded-full bg-violet-50 text-violet-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Algorithmic Bill of Materials decomposition converting plate volume predictions into tomorrow and 3-day raw commodity needs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateForecast}
          disabled={isCalculating}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors ${
            isCalculating ? 'opacity-70' : ''
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'Recalculating BOM...' : 'Refresh Forecast Ratios'}</span>
        </button>
      </div>

      {/* Reusable AI Insight */}
      <AIInsight
        title="Automated Bill of Materials Synthesis"
        message="Converting predicted 186 Chicken Biryani plates + 148 Masala Dosa plates generates immediate demand for 25 kg Basmati Rice, 22 kg Poultry, 8 kg Onions, 6 kg Farm Tomatoes, and 4 L Sunflower Oil."
        type="action"
        impactBadge="15 Ingredients Modeled"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Ingredients Analyzed
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{requirements.length} Commodities</p>
          <span className="text-[11px] text-slate-500">Across 5 menu categories</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
            Shortage Risk Items
          </span>
          <p className="text-2xl font-bold text-rose-800 mt-1">{totalShortageItems} Alerted</p>
          <span className="text-[11px] text-rose-600">Current stock &lt; tomorrow's kitchen need</span>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 shadow-xs">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
            Recommended Reorder Cost
          </span>
          <p className="text-2xl font-bold text-indigo-900 mt-1">
            {formatINR(totalRecommendedPurchaseCost)}
          </p>
          <span className="text-[11px] text-indigo-600">To maintain 3-day buffer</span>
        </div>
      </div>

      {/* Requirements Table Required By Requirement 10 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Ingredient Projection Table
            </h2>
            <p className="text-xs text-slate-500">
              Shows tomorrow's immediate demand, 3-day projection, shortage warning, and purchase recommendation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Ingredients ({requirements.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('shortagesOnly')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                selectedCategory === 'shortagesOnly'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Shortages Only ({totalShortageItems})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Ingredient</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Required for Tomorrow</th>
                <th className="py-3.5 px-4 text-right">Required for Next 3 Days</th>
                <th className="py-3.5 px-4 text-center">Shortage Alert</th>
                <th className="py-3.5 px-4 text-right">Recommended Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRequirements.map(req => {
                const hasShortage = req.shortage > 0;
                // Next 3 days projection is ~2.8x daily usage or 2.85x tomorrow's demand
                const threeDayNeed = Math.round(req.predictedRequirement * 2.85 * 10) / 10;

                return (
                  <tr
                    key={req.ingredientId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      hasShortage ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Ingredient */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>
                        <span>{req.ingredientName}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {formatINR(req.unitCostINR)}/{req.unit}
                        </span>
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      <span className="font-extrabold text-slate-900">{req.currentStock}</span>{' '}
                      <span className="text-slate-400 text-[11px]">{req.unit}</span>
                    </td>

                    {/* Required for Tomorrow */}
                    <td className="py-3.5 px-4 text-right font-bold text-indigo-700">
                      {req.predictedRequirement} {req.unit}
                    </td>

                    {/* Required for Next 3 Days */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {threeDayNeed} {req.unit}
                    </td>

                    {/* Shortage Alert (Yes / No) */}
                    <td className="py-3.5 px-4 text-center">
                      {hasShortage ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-800 font-extrabold bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Yes (-{req.shortage} {req.unit})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          No (Safe)
                        </span>
                      )}
                    </td>

                    {/* Recommended Purchase */}
                    <td className="py-3.5 px-4 text-right">
                      {req.recommendedPurchaseQty > 0 ? (
                        <div>
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-extrabold border border-indigo-200">
                            {req.recommendedPurchaseQty} {req.unit}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5 font-medium">
                            ≈ {formatINR(req.recommendedPurchaseQty * req.unitCostINR)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">0 {req.unit}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
