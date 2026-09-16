import React, { useState, useMemo } from 'react';
import {
  ChefHat,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Sliders,
  Printer,
  Calendar,
  Check,
  PenTool,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MealPeriod, MealPeriodPrepPlan } from '../types';
import { generatePreparationPlan } from '../services/forecastService';
import { AIInsight } from '../components/common/AIInsight';

export const PreparationPlanning: React.FC = () => {
  const navigate = useNavigate();
  const { dishes, salesRecords, addSalesRecord } = useAppContext();

  const [activeMealPeriod, setActiveMealPeriod] = useState<MealPeriod>('Lunch');
  const [globalSafetyBuffer, setGlobalSafetyBuffer] = useState<number>(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [planLastGenerated, setPlanLastGenerated] = useState<string>('Today at 07:15 AM');

  // Interactive actual prepared quantity state stored per meal period & dish
  const [actualPreparedMap, setActualPreparedMap] = useState<Record<string, number>>({});

  // Interactive plan state
  const [prepPlans, setPrepPlans] = useState<Record<MealPeriod, MealPeriodPrepPlan[]>>(() => ({
    Morning: generatePreparationPlan(dishes, 'Morning', 8),
    Lunch: generatePreparationPlan(dishes, 'Lunch', 8),
    Evening: generatePreparationPlan(dishes, 'Evening', 8),
    Dinner: generatePreparationPlan(dishes, 'Dinner', 8),
  }));

  const activeItems = prepPlans[activeMealPeriod] || [];

  // Group real-time sales for the active meal period by dish
  const mealSalesMap = useMemo(() => {
    const map: Record<string, { sold: number; remaining: number; wasted: number; prepared: number }> = {};
    salesRecords
      .filter(s => s.mealPeriod === activeMealPeriod)
      .forEach(s => {
        if (!map[s.dishId]) {
          map[s.dishId] = { sold: 0, remaining: 0, wasted: 0, prepared: 0 };
        }
        map[s.dishId].sold += s.quantitySold;
        map[s.dishId].remaining += s.quantityRemaining;
        map[s.dishId].wasted += s.quantityWasted;
        map[s.dishId].prepared += s.quantityPrepared;
      });
    return map;
  }, [salesRecords, activeMealPeriod]);

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setPrepPlans({
        Morning: generatePreparationPlan(dishes, 'Morning', globalSafetyBuffer),
        Lunch: generatePreparationPlan(dishes, 'Lunch', globalSafetyBuffer),
        Evening: generatePreparationPlan(dishes, 'Evening', globalSafetyBuffer),
        Dinner: generatePreparationPlan(dishes, 'Dinner', globalSafetyBuffer),
      });
      const now = new Date();
      setPlanLastGenerated(`Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      setIsGenerating(false);
    }, 700);
  };

  const handleActualPreparedChange = (dishId: string, value: number) => {
    setActualPreparedMap(prev => ({
      ...prev,
      [`${activeMealPeriod}_${dishId}`]: value,
    }));
  };

  const toggleItemStatus = (meal: MealPeriod, dishId: string) => {
    setPrepPlans(prev => {
      const currentList = prev[meal];
      const updated = currentList.map(item => {
        if (item.dishId === dishId) {
          const nextStatus: MealPeriodPrepPlan['status'] =
            item.status === 'Pending'
              ? 'In Progress'
              : item.status === 'In Progress'
              ? 'Completed'
              : 'Pending';
          return { ...item, status: nextStatus };
        }
        return item;
      });
      return { ...prev, [meal]: updated };
    });
  };

  const periodSummary = useMemo(() => {
    const totalPredicted = activeItems.reduce((sum, i) => sum + i.predictedDemand, 0);
    const totalPrep = activeItems.reduce((sum, i) => sum + i.recommendedPrep, 0);
    const totalSoldInShift = Object.values(mealSalesMap).reduce(
      (sum: number, s: { sold: number }) => sum + s.sold,
      0
    );
    const completedCount = activeItems.filter(i => i.status === 'Completed').length;
    return {
      totalPredicted,
      totalPrep,
      totalSoldInShift,
      completedCount,
      totalCount: activeItems.length,
      completionRate: Math.round((completedCount / Math.max(1, activeItems.length)) * 100),
    };
  }, [activeItems, mealSalesMap]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Smart Kitchen Preparation Planning
            </h1>
            <span className="p-1 rounded-full bg-amber-50 text-amber-600">
              <ChefHat className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Batch prep targets partitioned by Breakfast, Lunch, Evening, and Dinner shifts with live operational feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/sales-entry')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-colors"
          >
            <PenTool className="w-3.5 h-3.5 text-indigo-600" />
            <span>Enter Service Data</span>
          </button>

          <button
            type="button"
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all ${
              isGenerating ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Recalculating...' : 'Regenerate Shift Plan'}</span>
          </button>
        </div>
      </div>

      {/* AI Insight */}
      <AIInsight
        title="Kitchen Shift Buffer Rule"
        message="Lunch shift represents 52% of daily meat & biryani volume. A safety buffer of 8% is dynamically calculated to mitigate 12:45 PM corporate lunch rush surges without triggering food waste at 3:30 PM."
        type="action"
        impactBadge="Dynamic Safety Buffer Active"
      />

      {/* Meal Period Tabs and Buffer Slider Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          {/* Meal Period Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(
              [
                { id: 'Morning', label: 'Breakfast' },
                { id: 'Lunch', label: 'Lunch' },
                { id: 'Evening', label: 'Evening' },
                { id: 'Dinner', label: 'Dinner' },
              ] as const
            ).map(period => (
              <button
                key={period.id}
                type="button"
                onClick={() => setActiveMealPeriod(period.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeMealPeriod === period.id
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Safety Buffer Control */}
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Buffer:</span>
            <input
              type="range"
              min={3}
              max={18}
              step={1}
              value={globalSafetyBuffer}
              onChange={e => setGlobalSafetyBuffer(Number(e.target.value))}
              className="w-24 accent-indigo-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-indigo-600 w-8">{globalSafetyBuffer}%</span>
          </div>
        </div>

        {/* Shift Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Shift Planned Target
            </span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {periodSummary.totalPrep} portions
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/60">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
              Live Shift Orders Sold
            </span>
            <p className="text-lg font-bold text-indigo-950 mt-0.5">
              {periodSummary.totalSoldInShift} portions
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Prep Progress
            </span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {periodSummary.completedCount} of {periodSummary.totalCount} Stations Ready
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Last Model Sync
            </span>
            <p className="text-xs font-semibold text-slate-700 mt-1">{planLastGenerated}</p>
          </div>
        </div>
      </div>

      {/* Preparation Items List / Cards Required By Prompt */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {activeMealPeriod === 'Morning' ? 'Breakfast' : activeMealPeriod} Batch Production Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Enter actual prepared yield to sync live with sales counters and remaining stock
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {activeItems.length} dishes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Dish Name</th>
                <th className="py-3.5 px-4 text-center">Planned Quantity</th>
                <th className="py-3.5 px-4 text-center text-indigo-700 bg-indigo-50/50">
                  Actual Prepared
                </th>
                <th className="py-3.5 px-4 text-center font-bold text-emerald-700">Sold (Real-Time)</th>
                <th className="py-3.5 px-4 text-center">Remaining</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {activeItems.map(item => {
                const isCompleted = item.status === 'Completed';
                const isInProgress = item.status === 'In Progress';
                const liveSales = mealSalesMap[item.dishId] || { sold: 0, remaining: 0, wasted: 0, prepared: 0 };
                
                // Actual prepared quantity from state, or from sales input, or default recommended
                const currentActualPrepared =
                  actualPreparedMap[`${activeMealPeriod}_${item.dishId}`] ??
                  (liveSales.prepared > 0 ? liveSales.prepared : item.recommendedPrep);

                const currentSold = liveSales.sold;
                const currentRemaining = Math.max(0, currentActualPrepared - currentSold);

                const isDepleted = currentRemaining === 0 && currentSold > 0;
                const isWarning = currentRemaining < 10 && currentRemaining > 0;

                return (
                  <tr
                    key={item.dishId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCompleted ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>
                        <span>{item.dishName}</span>
                        <span className="block text-[11px] font-normal text-slate-400">
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* Planned Quantity */}
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
                        {item.recommendedPrep}
                      </span>
                    </td>

                    {/* Actual Prepared (user can enter or update) */}
                    <td className="py-3.5 px-4 text-center bg-indigo-50/30">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          value={currentActualPrepared}
                          onChange={e => handleActualPreparedChange(item.dishId, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-center font-bold text-slate-900 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
                        />
                        <span className="text-[10px] text-slate-400">pts</span>
                      </div>
                    </td>

                    {/* Sold (from real data) */}
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                      {currentSold > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                          {currentSold} sold
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Remaining */}
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span
                        className={`text-xs ${
                          isDepleted
                            ? 'text-rose-600 font-black'
                            : isWarning
                            ? 'text-amber-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {currentRemaining} left
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isDepleted ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Depleted
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleItemStatus(activeMealPeriod, item.dishId)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : isInProgress
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {item.status}
                          </button>
                        )}
                      </div>
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
