import React, { useState, useMemo } from 'react';
import {
  Radio,
  RefreshCw,
  TrendingUp,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Flame,
  PenTool,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateRealTimeMetrics } from '../services/forecastService';
import { RealTimeMetrics } from '../types';
import { formatNumber } from '../utils';
import { AIInsight } from '../components/common/AIInsight';
import { useAppContext } from '../context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const RealTimeForecast: React.FC = () => {
  const navigate = useNavigate();
  const { salesRecords, lastUpdatedTime } = useAppContext();

  const metrics = useMemo(() => {
    return calculateRealTimeMetrics(salesRecords);
  }, [salesRecords]);

  // Dynamic analysis from real entered data
  const realTimeAnalysis = useMemo(() => {
    if (salesRecords.length === 0) {
      return {
        title: "Awaiting Live Service Entry",
        message: "No sales transactions logged for today yet. Use 'Add Sales Data' to enter actual meal service figures (prepared, sold, remaining, wasted) and initiate live telemetry.",
        type: "positive" as const,
        impactBadge: "Real-Time Engine Ready",
      };
    }

    const dishCounts: Record<string, number> = {};
    salesRecords.forEach(s => {
      dishCounts[s.dishName] = (dishCounts[s.dishName] || 0) + s.quantitySold;
    });

    let topDish = '';
    let topCount = 0;
    Object.entries(dishCounts).forEach(([name, count]) => {
      if (count > topCount) {
        topCount = count;
        topDish = name;
      }
    });

    const isHigh = metrics.statusType === 'warning';
    const alertType: 'warning' | 'positive' = isHigh ? 'warning' : 'positive';
    return {
      title: isHigh ? "High Velocity Pacing Alert" : "Live Kitchen Pacing Diagnostic",
      message: `Current sustained throughput sits at ${metrics.ordersPerHour} orders/hr (${metrics.currentOrders} total portions recorded). Volume leader: ${topDish} (${topCount} portions sold). ${metrics.statusMessage}`,
      type: alertType,
      impactBadge: `${metrics.currentOrders} Portions Recorded`,
    };
  }, [salesRecords, metrics]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Real-Time Order Velocity & Demand Streaming
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time kitchen order pacing comparing active POS ticket velocity against pre-shift AI models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 shadow-xs transition-all ${
              isRefreshing ? 'opacity-70' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing POS...' : 'Refresh Live Feed'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Status Banner Required By Prompt */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          metrics.statusType === 'warning'
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${
              metrics.statusType === 'warning' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Live Status Velocity Message:
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Live Data: {lastUpdatedTime}
              </span>
            </div>
            <p className="text-sm font-bold mt-0.5">{metrics.statusMessage}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/sales-entry')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 shadow-xs transition-colors"
        >
          <PenTool className="w-3.5 h-3.5 text-indigo-600" />
          <span>Add Sales Data</span>
        </button>
      </div>

      {/* Reusable AI Insight */}
      <AIInsight
        title={realTimeAnalysis.title}
        message={realTimeAnalysis.message}
        type={realTimeAnalysis.type}
        impactBadge={realTimeAnalysis.impactBadge}
      />

      {/* 4 Live Summary Indicators Required By Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Orders</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatNumber(metrics.currentOrders)}</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
            {metrics.currentOrders > 0 ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Live logged portions today
              </span>
            ) : (
              <span>Awaiting first service ticket</span>
            )}
          </p>
        </div>

        {/* Orders per Hour */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders per Hour</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {metrics.ordersPerHour}{' '}
            <span className="text-xs font-normal text-slate-500">tickets/hr</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Average sustained kitchen throughput</p>
        </div>

        {/* Expected Remaining Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Expected Remaining Orders
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {formatNumber(metrics.expectedRemainingOrders)}{' '}
            <span className="text-xs font-normal text-slate-500">orders</span>
          </h3>
          <p className="text-xs text-amber-600 font-semibold mt-1">Evening & Dinner Rush Remaining</p>
        </div>

        {/* Updated Demand Prediction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Updated Day Forecast
            </span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-indigo-700">
            {formatNumber(metrics.updatedDemandPrediction)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Recalibrated from live intake pace</p>
        </div>
      </div>

      {/* Actual Orders vs Predicted Orders Over Time Chart Required By Prompt */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live Hour-by-Hour Actual vs Predicted Order Curve
            </h2>
            <p className="text-xs text-slate-500">
              Solid indigo area represents fulfilled POS orders; dashed line tracks initial AI model
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span className="text-slate-700">Actual Delivered Orders</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span className="text-slate-500">Predicted Benchmark</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.hourlyTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="realtimeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#realtimeGrad)"
                name="Actual POS Orders"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
                name="Predicted Model Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
