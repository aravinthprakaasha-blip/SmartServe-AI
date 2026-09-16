import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  ChefHat,
  IndianRupee,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  PenTool,
  Radio,
  PlusCircle,
  Activity,
  Layers,
  ArrowDownRight,
  ChevronRight,
  Boxes,
} from 'lucide-react';
import { StatCard } from '../components/cards/StatCard';
import { AIInsight } from '../components/common/AIInsight';
import { QuickEntryModal } from '../components/modals/QuickEntryModal';
import { useAppContext } from '../context/AppContext';
import { formatINR, formatNumber, formatDate, getGreeting } from '../utils';
import { predictNextMealDemand, calculateRealTimeMetrics } from '../services/forecastService';
import { DateFilterOption, MealPeriod } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface OutletContextType {
  triggerToast?: (msg: string) => void;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext<OutletContextType>();
  const triggerToast = outletCtx?.triggerToast || ((msg: string) => alert(msg));

  const {
    dishes,
    ingredients,
    filteredSalesRecords,
    salesRecords,
    weather,
    dateFilter,
    setDateFilter,
    customDateRange,
    setCustomDateRange,
    lastUpdatedTime,
    isFirestoreConnected,
  } = useAppContext();

  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  // Dynamic calculations from filtered sales records
  const totalSalesINR = filteredSalesRecords.reduce((acc, r) => acc + r.totalSales, 0);
  const totalSold = filteredSalesRecords.reduce((acc, r) => acc + r.quantitySold, 0);
  const totalPrepared = filteredSalesRecords.reduce((acc, r) => acc + r.quantityPrepared, 0);
  const totalRemaining = filteredSalesRecords.reduce((acc, r) => acc + r.quantityRemaining, 0);
  const totalWasted = filteredSalesRecords.reduce((acc, r) => acc + r.quantityWasted, 0);

  const wastePercentage =
    totalPrepared > 0 ? Math.round((totalWasted / totalPrepared) * 1000) / 10 : 0;

  // Real-time metrics
  const rtMetrics = calculateRealTimeMetrics(salesRecords);

  // Current meal period for Next Meal Forecast
  const currentHour = new Date().getHours();
  let currentMeal: MealPeriod = 'Lunch';
  if (currentHour < 11) currentMeal = 'Morning';
  else if (currentHour >= 11 && currentHour < 16) currentMeal = 'Lunch';
  else if (currentHour >= 16 && currentHour < 19) currentMeal = 'Evening';
  else currentMeal = 'Dinner';

  const nextMealForecast = predictNextMealDemand(currentMeal, salesRecords, dishes);

  // Low stock and critical items count
  const lowStockIngredients = ingredients.filter(
    i => i.status === 'Low Stock' || i.status === 'Critical'
  );
  const lowStockCount = lowStockIngredients.length;

  // Current Inventory Value in INR (₹)
  const currentInventoryValue = ingredients.reduce(
    (acc, ing) => acc + ing.currentStock * ing.costPerUnitINR,
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Greeting, Live Status Indicator, Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {getGreeting()}, Kitchen Manager
            </h1>
            <span className="p-1 rounded-full bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </span>
            {/* Real-Time Live Sync Indicator */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Sync Active • Updated {lastUpdatedTime}</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate()}</span>
            <span className="text-slate-300">•</span>
            <span>{weather.temperatureC}°C, {weather.condition} ({weather.rainProbability}% Rain)</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-medium">{rtMetrics.statusMessage}</span>
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsQuickEntryOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Quick Entry</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/sales-entry')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition-colors"
          >
            <PenTool className="w-4 h-4 text-indigo-600" />
            <span>Enter Today's Data</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Analytics Time Horizon:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom'] as DateFilterOption[]).map(
            option => (
              <button
                key={option}
                type="button"
                onClick={() => setDateFilter(option)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  dateFilter === option
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option}
              </button>
            )
          )}

          {dateFilter === 'Custom' && (
            <div className="flex items-center gap-1.5 ml-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={e =>
                  setCustomDateRange({ ...customDateRange, start: e.target.value })
                }
                className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={e =>
                  setCustomDateRange({ ...customDateRange, end: e.target.value })
                }
                className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Primary AI Operational Banner */}
      <AIInsight
        title="Predictive Operational Intelligence"
        message={`Currently tracking ${totalSold} actual portions sold. Based on morning & lunch velocity, next meal (${nextMealForecast.nextMeal}) requires ${nextMealForecast.recommendedPrep} prepared portions.`}
        type="action"
        impactBadge={`Next: ${nextMealForecast.nextMeal}`}
        actionLabel="View Kitchen Prep Plan"
        onActionClick={() => navigate('/preparation-planning')}
      />

      {/* Real-Time Operational Stat Cards Required By Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Total Sales */}
        <StatCard
          id="stat-total-sales"
          title="Total Billed Sales"
          value={formatINR(totalSalesINR)}
          change={`${filteredSalesRecords.length} records logged`}
          trend="up"
          trendLabel={dateFilter}
          icon={IndianRupee}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          onClick={() => navigate('/sales-entry')}
        />

        {/* Total Orders Sold */}
        <StatCard
          id="stat-orders-sold"
          title="Total Orders Sold"
          value={`${formatNumber(totalSold)} plates`}
          change={`${rtMetrics.ordersPerHour} plates/hr avg`}
          trend="up"
          trendLabel="live customer volume"
          icon={ShoppingBag}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          onClick={() => navigate('/sales-entry')}
        />

        {/* Total Food Prepared */}
        <StatCard
          id="stat-food-prepared"
          title="Total Food Prepared"
          value={`${formatNumber(totalPrepared)} plates`}
          change={`${totalRemaining} still remaining`}
          trend="neutral"
          trendLabel="batch kitchen yield"
          icon={ChefHat}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          onClick={() => navigate('/preparation-planning')}
        />

        {/* Total Food Wasted & % */}
        <StatCard
          id="stat-food-wasted"
          title="Food Wasted & Spoilage"
          value={`${totalWasted} plates`}
          change={`${wastePercentage}% waste rate`}
          trend={wastePercentage > 10 ? 'down' : 'neutral'}
          trendLabel={wastePercentage > 10 ? 'Above target' : 'Within budget'}
          icon={Trash2}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          onClick={() => navigate('/waste-tracking')}
        />
      </div>

      {/* Secondary Strategic Operational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Real-Time Demand Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demand Velocity</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              rtMetrics.statusType === 'warning'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {rtMetrics.statusType === 'warning' ? 'Higher than Expected' : 'Optimal Tracking'}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{rtMetrics.currentOrders} orders</span>
            <p className="text-xs text-slate-600 mt-1">{rtMetrics.statusMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/real-time')}
            className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            <span>Open Real-Time Stream</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Next Meal Forecast */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Meal Target</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
              {nextMealForecast.nextMeal}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-indigo-600">{nextMealForecast.predictedOrders} orders</span>
            <p className="text-xs text-slate-600 mt-1">
              Recommended prep: <strong>{nextMealForecast.recommendedPrep} plates</strong> ({nextMealForecast.rationale})
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/preparation-planning')}
            className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            <span>Kitchen Prep Breakdown</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Health</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              lowStockCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {lowStockCount > 0 ? `${lowStockCount} Low Items` : 'All Stock Healthy'}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{formatINR(currentInventoryValue)}</span>
            <p className="text-xs text-slate-600 mt-1">
              {lowStockCount > 0
                ? `${lowStockIngredients.map(i => i.name).slice(0, 2).join(', ')} require replenishment.`
                : 'Raw materials inventory is adequately stocked.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/smart-purchasing')}
            className="mt-3 text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
          >
            <span>Generate Purchase Order</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Charts: Projected vs Actual Order Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Today's Actual vs Projected Service Orders
              </h2>
              <p className="text-xs text-slate-500">
                Dynamically refreshed from staff sales inputs across morning, lunch, and dinner services
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                <span className="text-slate-700 font-semibold">Actual Sales Input</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-300"></span>
                <span className="text-slate-500">AI Projected Curve</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rtMetrics.hourlyTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#orderGrad)"
                  name="Actual Orders"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                  name="Projected Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Remaining expected orders today: <strong>{rtMetrics.expectedRemainingOrders} plates</strong>
            </span>
            <button
              onClick={() => navigate('/real-time')}
              className="font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Open Full Real-Time Forecast <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Column: Menu Dish Demand Leaderboard */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Predicted Dish Demand</h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Confidence &gt; 90%
              </span>
            </div>

            <div className="space-y-3">
              {dishes.slice(0, 5).map(dish => (
                <div
                  key={dish.id}
                  onClick={() => navigate('/dish-predictions')}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-100 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{dish.name}</p>
                    <p className="text-[11px] text-slate-500">₹{dish.priceINR} • {dish.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900">
                      {dish.predictedDemand} <span className="text-[10px] font-normal text-slate-500">orders</span>
                    </p>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                      {dish.confidence}% conf.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/dish-predictions')}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-center block transition-colors"
            >
              View Dish Predictions ({dishes.length} Items)
            </button>
          </div>
        </div>
      </div>

      {/* Recent Entered Data Snapshot Table with Quick Edit */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Service Records</h2>
            <p className="text-xs text-slate-500">
              Staff inputs affecting inventory and kitchen prep plans in real time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQuickEntryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Quick Entry</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/sales-entry')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <span>Full Data Entry Page</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4 text-center">Prepared</th>
                <th className="py-3 px-4 text-center font-bold text-indigo-700">Sold</th>
                <th className="py-3 px-4 text-center">Remaining</th>
                <th className="py-3 px-4 text-center text-rose-600">Waste</th>
                <th className="py-3 px-4">Meal Period</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSalesRecords.slice(0, 5).map(record => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600">{record.time}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{record.dishName}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">{record.quantityPrepared}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-600">{record.quantitySold}</td>
                  <td className="py-3 px-4 text-center font-medium text-slate-600">{record.quantityRemaining}</td>
                  <td className="py-3 px-4 text-center font-semibold text-rose-600">{record.quantityWasted}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                      {record.mealPeriod === 'Morning' ? 'Breakfast' : record.mealPeriod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">
                    ₹{record.totalSales.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {record.isDemo ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Demo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Live Data
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Entry Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        onSuccessToast={msg => triggerToast(msg)}
      />
    </div>
  );
};
