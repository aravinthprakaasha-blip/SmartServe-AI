import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  UtensilsCrossed,
  Layers,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useRestaurantData } from '../hooks';
import { Dish, DemandStatus } from '../types';
import { getDemandBadgeClass, formatINR } from '../utils';
import { AIInsight } from '../components/common/AIInsight';
import { Modal } from '../components/common/Modal';

type SortField = 'name' | 'historicalAvg' | 'predictedDemand' | 'recommendedPrep' | 'confidence';
type SortOrder = 'asc' | 'desc';

export const DishPredictions: React.FC = () => {
  const { dishes, updateDish, ingredients, salesRecords } = useRestaurantData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('predictedDemand');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Selected dish for recipe ingredient detail modal
  const [activeDishModal, setActiveDishModal] = useState<Dish | null>(null);

  // Pre-calculate live sales statistics per dish from entered sales records
  const dishSalesMap = useMemo(() => {
    const map: Record<string, { sold: number; remaining: number; wasted: number; prepared: number }> = {};
    salesRecords.forEach(s => {
      if (!map[s.dishId]) {
        map[s.dishId] = { sold: 0, remaining: 0, wasted: 0, prepared: 0 };
      }
      map[s.dishId].sold += s.quantitySold;
      map[s.dishId].remaining += s.quantityRemaining;
      map[s.dishId].wasted += s.quantityWasted;
      map[s.dishId].prepared += s.quantityPrepared;
    });
    return map;
  }, [salesRecords]);

  const categories = useMemo(() => {
    const set = new Set(dishes.map(d => d.category));
    return Array.from(set);
  }, [dishes]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedDishes = useMemo(() => {
    return dishes
      .filter(dish => {
        const matchesSearch =
          dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'all' || dish.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || dish.status === selectedStatus;
        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [dishes, searchQuery, selectedCategory, selectedStatus, sortField, sortOrder]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dish Demand & Preparation Predictions
            </h1>
            <span className="p-1 rounded-full bg-indigo-50 text-indigo-600">
              <UtensilsCrossed className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Item-by-item predictive forecasts with historical baselines, AI confidence ratings, and safety prep buffers.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            Total Menu Items: {dishes.length}
          </span>
        </div>
      </div>

      {/* AI Insight */}
      <AIInsight
        title="Dish Mix Optimization"
        message="Biryani and South Indian Breakfast show highest demand velocity. Masala Dosa prep target of 155 units includes a 5% buffer to cover morning delivery app surge without late-morning stockouts."
        type="positive"
        impactBadge="Optimal Prep Alignment"
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish name or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Demand Level:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="all">All Levels</option>
              <option value="High">High Demand</option>
              <option value="Medium">Medium Demand</option>
              <option value="Low">Low Demand</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Dishes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Dish Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('historicalAvg')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Hist. Avg (orders)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('predictedDemand')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Predicted Orders</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('recommendedPrep')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Recommended Prep</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center font-bold text-indigo-700 bg-indigo-50/50">
                  Actual Sold
                </th>
                <th className="py-3.5 px-4 text-center font-semibold text-slate-700">
                  Remaining
                </th>
                <th className="py-3.5 px-4 text-center font-semibold text-rose-600">
                  Wastage
                </th>
                <th
                  onClick={() => handleSort('confidence')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Confidence</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Demand Status</th>
                <th className="py-3.5 px-4 text-center">Trend</th>
                <th className="py-3.5 px-4 text-right">Recipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAndSortedDishes.map(dish => {
                const diff = dish.predictedDemand - dish.historicalAvg;
                const liveStats = dishSalesMap[dish.id] || { sold: 0, remaining: 0, wasted: 0, prepared: 0 };
                return (
                  <tr
                    key={dish.id}
                    className="hover:bg-indigo-50/20 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {dish.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span>{dish.category}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-600">{formatINR(dish.priceINR)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                      {dish.historicalAvg}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {dish.predictedDemand}
                      </span>
                      {diff !== 0 && (
                        <span
                          className={`block text-[10px] font-semibold ${
                            diff > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {diff > 0 ? `+${diff}` : diff} vs avg
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold border border-amber-200">
                        {dish.recommendedPrep} units
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        +{dish.recommendedPrep - dish.predictedDemand} buffer
                      </span>
                    </td>

                    {/* Actual Sold (updated from real data) */}
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-700 bg-indigo-50/30">
                      {liveStats.sold > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-700">
                          {liveStats.sold}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Remaining (updated from real data) */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                      {liveStats.remaining > 0 ? (
                        <span>{liveStats.remaining}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Wastage (updated from real data) */}
                    <td className="py-3.5 px-4 text-center font-semibold text-rose-600">
                      {liveStats.wasted > 0 ? (
                        <span>{liveStats.wasted}</span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-slate-900">{dish.confidence}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              dish.confidence >= 92 ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${dish.confidence}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getDemandBadgeClass(
                          dish.status
                        )}`}
                      >
                        {dish.status} Demand
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {dish.trend === 'up' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <TrendingUp className="w-3.5 h-3.5" /> Surge
                        </span>
                      )}
                      {dish.trend === 'down' && (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                          <TrendingDown className="w-3.5 h-3.5" /> Dip
                        </span>
                      )}
                      {dish.trend === 'neutral' && (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                          <Minus className="w-3.5 h-3.5" /> Stable
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveDishModal(dish)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition-colors"
                      >
                        Ingredients
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSortedDishes.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No dishes matching your current filter criteria.
          </div>
        )}
      </div>

      {/* Ingredient breakdown modal */}
      {activeDishModal && (
        <Modal
          isOpen={!!activeDishModal}
          onClose={() => setActiveDishModal(null)}
          title={`Recipe Ingredient Breakdown: ${activeDishModal.name}`}
          subtitle={`Required raw ingredients for ${activeDishModal.recommendedPrep} recommended plates`}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Predicted Demand:</span>{' '}
                <strong className="text-slate-900">{activeDishModal.predictedDemand} plates</strong>
              </div>
              <div>
                <span className="text-slate-500">Target Prep with Safety Buffer:</span>{' '}
                <strong className="text-indigo-600">{activeDishModal.recommendedPrep} plates</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Raw Ingredients Needed:
              </h4>
              {activeDishModal.ingredients.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {activeDishModal.ingredients.map(usage => {
                    const ing = ingredients.find(i => i.id === usage.ingredientId);
                    const totalQty =
                      Math.round(usage.quantityPerPortion * activeDishModal.recommendedPrep * 10) / 10;
                    return (
                      <div
                        key={usage.ingredientId}
                        className="p-3 flex items-center justify-between text-xs bg-white"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {ing ? ing.name : usage.ingredientId}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Portion ratio: {usage.quantityPerPortion} {ing?.unit || 'unit'} per plate
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">
                            {totalQty} {ing?.unit}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Current Stock: {ing?.currentStock} {ing?.unit}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Prepared on-order fresh juice / raw fruit requisition.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveDishModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
