import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  Trash2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Utensils,
  Lightbulb,
  Clock,
  Layers,
  ThermometerSnowflake,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { calculateWasteRiskForDishes } from '../services/forecastService';
import { WasteRiskItem } from '../types';
import { formatINR, getRiskLevelBadgeClass } from '../utils';
import { AIInsight } from '../components/common/AIInsight';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export const WastePrediction: React.FC = () => {
  const { dishes } = useAppContext();

  const [riskItems, setRiskItems] = useState<WasteRiskItem[]>(() =>
    calculateWasteRiskForDishes(dishes)
  );
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [appliedOptimization, setAppliedOptimization] = useState(false);

  const handleApplyAIOptimization = () => {
    // Automatically optimize prep buffers on high risk items
    const optimized = riskItems.map(item => {
      if (item.riskLevel === 'HIGH' || item.riskLevel === 'MEDIUM') {
        const saferPrep = Math.max(item.predictedDemand, Math.round(item.predictedDemand * 1.04));
        const newWaste = Math.max(0, saferPrep - item.predictedDemand);
        return {
          ...item,
          recommendedPrep: saferPrep,
          predictedWastePortions: newWaste,
          financialLossINR: Math.round(newWaste * 140),
          riskLevel: 'LOW' as const,
          recommendation: 'Buffer trimmed to +4% dynamic threshold; waste minimized.',
        };
      }
      return item;
    });
    setRiskItems(optimized);
    setAppliedOptimization(true);
  };

  const filteredItems = useMemo(() => {
    if (selectedRiskFilter === 'all') return riskItems;
    return riskItems.filter(i => i.riskLevel === selectedRiskFilter);
  }, [riskItems, selectedRiskFilter]);

  // Summary Metrics Required by Prompt
  const totalPredictedWastePortions = riskItems.reduce((acc, i) => acc + i.predictedWastePortions, 0);
  const totalPotentialFinancialLoss = riskItems.reduce((acc, i) => acc + i.financialLossINR, 0);
  const highRiskDishesCount = riskItems.filter(i => i.riskLevel === 'HIGH').length;

  // Chart data for dishes with highest waste risk
  const chartData = useMemo(() => {
    return [...riskItems]
      .sort((a, b) => b.financialLossINR - a.financialLossINR)
      .slice(0, 6)
      .map(item => ({
        name: item.dishName.split(' ')[0],
        fullName: item.dishName,
        loss: item.financialLossINR,
        waste: item.predictedWastePortions,
        risk: item.riskLevel,
      }));
  }, [riskItems]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Food Waste Prediction & Risk Guardrails
            </h1>
            <span className="p-1 rounded-full bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pre-service predictive analysis identifying over-preparation before food enters production pans.
          </p>
        </div>

        <button
          type="button"
          onClick={handleApplyAIOptimization}
          disabled={appliedOptimization}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors ${
            appliedOptimization ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{appliedOptimization ? 'AI Guardrails Active' : 'Trim Dangerous Prep Buffers'}</span>
        </button>
      </div>

      {/* AI Insight */}
      <AIInsight
        title="Over-Preparation Hotspot Detection"
        message="Executive Veg Meals and Parotta dough batches currently hold +15% over-preparation buffers, representing ₹4,800 in avoidable end-of-day kitchen binning. Adjusting safety buffer to 4% prevents 22 wasted portions."
        type="warning"
        impactBadge="Avoidable Loss: ₹4,800"
      />

      {/* Key Metric Cards as specified in Requirement 13 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Predicted Waste */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Predicted Waste
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {totalPredictedWastePortions}{' '}
            <span className="text-xs font-normal text-slate-500">portions (~14.2 kg)</span>
          </h3>
          <p className="text-xs text-amber-600 font-semibold mt-1">
            Calculated from service period batch overhang
          </p>
        </div>

        {/* Estimated Waste Cost (₹) */}
        <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Estimated Waste Cost (₹)
            </span>
            <div className="p-2 rounded-lg bg-rose-200 text-rose-800">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-rose-800">
            {formatINR(totalPotentialFinancialLoss)}
          </h3>
          <p className="text-xs text-rose-700 mt-1 font-medium">Daily COGS discarded if unmanaged</p>
        </div>

        {/* High Risk Dishes */}
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              High Risk Dishes
            </span>
            <div className="p-2 rounded-lg bg-amber-200 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-800">
            {highRiskDishesCount} Dishes Flagged
          </h3>
          <p className="text-xs text-amber-700 mt-1 font-medium">
            Requires active batch cooking splits
          </p>
        </div>
      </div>

      {/* Main Causes of Waste Section (Requirement 13) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          Root Cause Analysis: Main Drivers of Kitchen Food Waste
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Machine learning decomposition of historic shrinkage logs categorized by operational failure points
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                1. Overproduction
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-rose-100 text-rose-800">
                54% Impact
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-2">Cooked Batches &gt; Final Plate Demand</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Kitchen staff preparing 80-portion handis of Biryani and Dal at 1:30 PM when foot traffic tapers down by 2:15 PM.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                2. Low Demand
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-100 text-amber-800">
                28% Impact
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-2">Weather &amp; Day-of-Week Variance</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Mid-week rain suppresses office lunch footfall by ~22%, leaving specialty breads and batter unused before closing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                3. Expired Ingredients
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-indigo-100 text-indigo-800">
                18% Impact
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-2">Perishable Storage Expiration</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Raw poultry, fresh paneer, and mint leaves spoiled due to over-ordering without strict First-In First-Out (FIFO) rotation.
            </p>
          </div>
        </div>
      </div>

      {/* AI Recommendations to Reduce Waste (Requirement 13) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-300" />
          <h2 className="text-sm font-bold">AI Actionable Recommendations to Reduce Food Waste</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/10 border border-white/15">
            <p className="font-bold text-amber-300">Staggered Batch Production</p>
            <p className="text-slate-200 mt-1 text-[11px]">
              Cook 65% of lunch Biryani at 11:30 AM, and hold the remaining 35% in marination for on-demand 1:15 PM final cooking.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/15">
            <p className="font-bold text-emerald-300">Dynamic Evening Discounting</p>
            <p className="text-slate-200 mt-1 text-[11px]">
              Automatically push remaining prepared meals to staff meal or 25% off takeaway combos at 9:30 PM rather than discarding.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/15">
            <p className="font-bold text-sky-300">Weather-Triggered Prep Throttling</p>
            <p className="text-slate-200 mt-1 text-[11px]">
              Rain predictions reduce cold starter prep by 15% and reallocate volume towards hot beverages and rasam soups.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Indicator Chart: Dishes with Highest Waste Risk */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Dishes with Highest Projected Financial Spoilage Risk
            </h2>
            <p className="text-xs text-slate-500">
              Calculated by multiplying projected surplus plates with ingredient production costs
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="fullName" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={val => `₹${val}`}
              />
              <Tooltip
                formatter={(val: number) => [`${formatINR(val)} Potential Loss`, 'Waste Risk']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar dataKey="loss" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.risk === 'HIGH' ? '#f43f5e' : entry.risk === 'MEDIUM' ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Waste Prediction Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">
            Dish-by-Dish Spoilage Risk Assessment
          </h2>

          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span>Filter Risk:</span>
            <button
              type="button"
              onClick={() => setSelectedRiskFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedRiskFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({riskItems.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedRiskFilter('HIGH')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedRiskFilter === 'HIGH'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              HIGH Risk ({riskItems.filter(i => i.riskLevel === 'HIGH').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedRiskFilter('MEDIUM')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedRiskFilter === 'MEDIUM'
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              MEDIUM Risk ({riskItems.filter(i => i.riskLevel === 'MEDIUM').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedRiskFilter('LOW')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedRiskFilter === 'LOW'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              LOW Risk ({riskItems.filter(i => i.riskLevel === 'LOW').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Dish Item</th>
                <th className="py-3.5 px-4 text-right">Expected Prep</th>
                <th className="py-3.5 px-4 text-right">Predicted Demand</th>
                <th className="py-3.5 px-4 text-right">Predicted Waste</th>
                <th className="py-3.5 px-4 text-right">Financial Loss (₹)</th>
                <th className="py-3.5 px-4 text-center">Risk Level</th>
                <th className="py-3.5 px-4">AI Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.map(item => (
                <tr key={item.dishId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.dishName}</td>

                  <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                    {item.recommendedPrep} plates
                  </td>

                  <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                    {item.predictedDemand} plates
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="font-extrabold text-slate-900">
                      {item.predictedWastePortions} portions
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                    {formatINR(item.financialLossINR)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskLevelBadgeClass(
                        item.riskLevel
                      )}`}
                    >
                      {item.riskLevel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 text-[11px] leading-snug">
                    {item.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
