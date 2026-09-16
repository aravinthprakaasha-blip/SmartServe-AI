import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Filter,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  BarChart3,
  Layers,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { useRestaurantData } from '../hooks';
import { generateHistoricalDemand } from '../data/mockData';
import { formatNumber } from '../utils';
import { AIInsight } from '../components/common/AIInsight';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

type TimeRange = 'today' | 'tomorrow' | '7days' | '30days';
type Granularity = 'Day' | 'Week' | 'Month';
type MealFilter = 'All' | 'Morning' | 'Lunch' | 'Evening' | 'Dinner';

export const DemandForecasting: React.FC = () => {
  const { dishes, weather, events } = useRestaurantData();

  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [granularity, setGranularity] = useState<Granularity>('Day');
  const [selectedMeal, setSelectedMeal] = useState<MealFilter>('All');
  const [selectedDishId, setSelectedDishId] = useState<string>('all');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Base historical and simulated forward series
  const rawHistorical = useMemo(() => generateHistoricalDemand(), []);

  // Compute chart data based on active filters
  const chartData = useMemo(() => {
    // Multiplier if a specific dish is chosen vs all dishes
    let dishMultiplier = 1.0;
    if (selectedDishId !== 'all') {
      const d = dishes.find(dish => dish.id === selectedDishId);
      if (d) {
        dishMultiplier = d.predictedDemand / 1180;
      }
    }

    // Meal multiplier
    let mealMultiplier = 1.0;
    if (selectedMeal === 'Morning') mealMultiplier = 0.22;
    else if (selectedMeal === 'Lunch') mealMultiplier = 0.38;
    else if (selectedMeal === 'Evening') mealMultiplier = 0.16;
    else if (selectedMeal === 'Dinner') mealMultiplier = 0.24;

    if (timeRange === 'today') {
      // Hourly points for today
      return [
        { label: '08:00', historical: Math.round(50 * dishMultiplier), predicted: Math.round(52 * dishMultiplier) },
        { label: '10:00', historical: Math.round(85 * dishMultiplier), predicted: Math.round(92 * dishMultiplier) },
        { label: '12:00', historical: Math.round(155 * dishMultiplier), predicted: Math.round(168 * dishMultiplier) },
        { label: '14:00', historical: Math.round(180 * dishMultiplier), predicted: Math.round(188 * dishMultiplier) },
        { label: '16:00', historical: Math.round(75 * dishMultiplier), predicted: Math.round(82 * dishMultiplier) },
        { label: '18:00', historical: Math.round(110 * dishMultiplier), predicted: Math.round(124 * dishMultiplier) },
        { label: '20:00', historical: Math.round(175 * dishMultiplier), predicted: Math.round(195 * dishMultiplier) },
        { label: '22:00', historical: Math.round(70 * dishMultiplier), predicted: Math.round(78 * dishMultiplier) },
      ];
    }

    if (timeRange === 'tomorrow') {
      return [
        { label: '08:00 (Tom)', historical: Math.round(55 * dishMultiplier), predicted: Math.round(62 * dishMultiplier) },
        { label: '10:00 (Tom)', historical: Math.round(90 * dishMultiplier), predicted: Math.round(102 * dishMultiplier) },
        { label: '12:00 (Tom)', historical: Math.round(165 * dishMultiplier), predicted: Math.round(184 * dishMultiplier) },
        { label: '14:00 (Tom)', historical: Math.round(190 * dishMultiplier), predicted: Math.round(208 * dishMultiplier) },
        { label: '16:00 (Tom)', historical: Math.round(80 * dishMultiplier), predicted: Math.round(95 * dishMultiplier) },
        { label: '18:00 (Tom)', historical: Math.round(120 * dishMultiplier), predicted: Math.round(140 * dishMultiplier) },
        { label: '20:00 (Tom)', historical: Math.round(190 * dishMultiplier), predicted: Math.round(220 * dishMultiplier) },
        { label: '22:00 (Tom)', historical: Math.round(80 * dishMultiplier), predicted: Math.round(92 * dishMultiplier) },
      ];
    }

    if (timeRange === '7days') {
      const days = ['Mon (15th)', 'Tue (16th)', 'Wed (17th)', 'Thu (18th)', 'Fri (19th)', 'Sat (20th)', 'Sun (21st)'];
      return days.map((day, i) => {
        const isWknd = i >= 4;
        const baseH = isWknd ? 1350 : 1080;
        const baseP = isWknd ? 1480 : 1160;
        return {
          label: day,
          historical: Math.round(baseH * dishMultiplier * mealMultiplier),
          predicted: Math.round(baseP * dishMultiplier * mealMultiplier),
        };
      });
    }

    // 30 days
    return rawHistorical.map((h, i) => ({
      label: h.date.slice(5),
      historical: Math.round(h.actualOrders * dishMultiplier * mealMultiplier),
      predicted: Math.round(h.predictedOrders * dishMultiplier * mealMultiplier),
    }));
  }, [timeRange, selectedMeal, selectedDishId, dishes, rawHistorical]);

  // Overall metric highlights for quick glance
  const summaryStats = useMemo(() => {
    const todayTotal = 1180;
    const tomorrowTotal = 1320; // higher due to event/weekend ramp
    const next7DaysAvg = 1245;
    const next30DaysTotal = 37800;

    return {
      today: todayTotal,
      tomorrow: tomorrowTotal,
      next7DaysAvg,
      next30DaysTotal,
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              AI Demand Forecasting Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Neural Weighting
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Correlates 30-day historical orders with weather forecasts, day-of-week seasonality, and upcoming events.
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'today'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('tomorrow')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'tomorrow'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === '7days'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Next 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === '30days'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Next 30 Days
          </button>
        </div>
      </div>

      {/* Reusable AI Insight */}
      <AIInsight
        title="Weekly Forecast Analysis"
        message="Upcoming Friday & Saturday projected orders exceed weekday baseline by +21.4% driven by the IPL Cricket Match. Biryani and tandoori starter demand will spike between 7:30 PM and 10:00 PM."
        type="action"
        impactBadge="+21.4% Weekend Jump"
      />

      {/* Horizon Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setTimeRange('today')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            timeRange === 'today'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Today's Demand</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {formatNumber(summaryStats.today)}{' '}
            <span className="text-xs font-normal text-slate-500">orders</span>
          </h3>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +6.5% vs Tuesday avg
          </p>
        </div>

        <div
          onClick={() => setTimeRange('tomorrow')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            timeRange === 'tomorrow'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Tomorrow's Demand</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {formatNumber(summaryStats.tomorrow)}{' '}
            <span className="text-xs font-normal text-slate-500">orders</span>
          </h3>
          <p className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +11.8% ramp-up
          </p>
        </div>

        <div
          onClick={() => setTimeRange('7days')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            timeRange === '7days'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Next 7 Days (Daily Avg)</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {formatNumber(summaryStats.next7DaysAvg)}{' '}
            <span className="text-xs font-normal text-slate-500">/day</span>
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-1">8,715 total plates</p>
        </div>

        <div
          onClick={() => setTimeRange('30days')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            timeRange === '30days'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Next 30 Days Forecast</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {formatNumber(summaryStats.next30DaysTotal)}{' '}
            <span className="text-xs font-normal text-slate-500">orders</span>
          </h3>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +4.8% MoM growth
          </p>
        </div>
      </div>

      {/* Main Interactive Chart Section with Multi-filters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Dish */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Dish:</span>
              <select
                value={selectedDishId}
                onChange={e => setSelectedDishId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-indigo-500"
              >
                <option value="all">All Dishes (Aggregate)</option>
                {dishes.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Meal Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Meal Type:</span>
              <select
                value={selectedMeal}
                onChange={e => setSelectedMeal(e.target.value as MealFilter)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-indigo-500"
              >
                <option value="All">All Meal Shifts</option>
                <option value="Morning">Morning Breakfast</option>
                <option value="Lunch">Lunch Service</option>
                <option value="Evening">Evening Snacks/Tea</option>
                <option value="Dinner">Dinner Rush</option>
              </select>
            </div>

            {/* Granularity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">View:</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                {(['Day', 'Week', 'Month'] as Granularity[]).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGranularity(g)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      granularity === g
                        ? 'bg-white text-indigo-700 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Chart style:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`px-2 py-1 rounded-md ${
                  chartType === 'line'
                    ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Line
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-2 py-1 rounded-md ${
                  chartType === 'bar'
                    ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Bar
              </button>
            </div>
          </div>
        </div>

        {/* The Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Historical Orders vs. AI Predicted Demand
              </h2>
              <p className="text-xs text-slate-500">
                Comparing historical actuals with neural projected demand for {timeRange.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Historical Demand"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4f46e5' }}
                    name="AI Predicted Demand"
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar
                    dataKey="historical"
                    fill="#cbd5e1"
                    radius={[4, 4, 0, 0]}
                    name="Historical Demand"
                  />
                  <Bar
                    dataKey="predicted"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    name="AI Predicted Demand"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Prediction Cards: Show top predicted dishes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              AI Dish Predictions & Confidence Metrics
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by predicted volume for today's shifts with statistical confidence intervals
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing top {dishes.length} menu items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dishes.map(dish => {
            const isHighConfidence = dish.confidence >= 92;
            return (
              <div
                key={dish.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {dish.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {dish.category}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHighConfidence
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {dish.confidence}% AI Conf
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Expected Orders
                    </span>
                    <p className="text-xl font-bold text-slate-900 mt-0.5">
                      {dish.predictedDemand}{' '}
                      <span className="text-xs font-normal text-slate-500">plates</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Hist. Avg
                    </span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {dish.historicalAvg} / day
                    </p>
                  </div>
                </div>

                {/* Progress bar for confidence */}
                <div className="mt-3">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isHighConfidence ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${dish.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
