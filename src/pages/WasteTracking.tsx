import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Plus,
  TrendingDown,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Tag,
  CheckCircle2,
  Utensils,
  Recycle,
  Sparkles,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { WasteLog, WasteReason, WasteActionTaken } from '../types';
import { formatINR, exportToCSV } from '../utils';
import { AIInsight } from '../components/common/AIInsight';
import { Modal } from '../components/common/Modal';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const REASON_COLORS: Record<string, string> = {
  Overcooked: '#ef4444', // red
  'Customer Leftover': '#06b6d4', // cyan
  Expired: '#f43f5e', // rose
  Spillage: '#8b5cf6', // violet
  Overproduction: '#f59e0b', // amber
  Damaged: '#e11d48', // deep rose
  Other: '#64748b', // slate
};

export const WasteTracking: React.FC = () => {
  const { wasteLogs, addWasteLog, deleteWasteLog, dishes } = useAppContext();

  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState(dishes[0]?.name || 'Chicken Biryani');
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [wasteQty, setWasteQty] = useState<number>(3);
  const [wasteUnit, setWasteUnit] = useState<string>('portions');
  const [wasteReason, setWasteReason] = useState<WasteReason>('Overcooked');
  const [actionTaken, setActionTaken] = useState<WasteActionTaken>('Discarded');
  const [wasteCost, setWasteCost] = useState<number>(360);

  // Auto-update estimated cost when dish or qty changes
  const handleDishChange = (dishName: string) => {
    setSelectedItemName(dishName);
    const foundDish = dishes.find(d => d.name === dishName);
    if (foundDish) {
      const approxCostPerPortion = Math.round(foundDish.priceINR * 0.4);
      setWasteCost(Math.round(approxCostPerPortion * wasteQty));
    }
  };

  const handleQtyChange = (qty: number) => {
    setWasteQty(qty);
    const foundDish = dishes.find(d => d.name === selectedItemName);
    const approxCostPerPortion = foundDish ? Math.round(foundDish.priceINR * 0.4) : 120;
    setWasteCost(Math.round(approxCostPerPortion * qty));
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    addWasteLog({
      date: logDate,
      item: selectedItemName,
      quantity: Number(wasteQty),
      unit: wasteUnit,
      reason: wasteReason,
      costINR: Number(wasteCost),
      actionTaken: actionTaken,
    });
    setShowLogModal(false);
  };

  // Summary Metrics
  const totalCost = useMemo(() => wasteLogs.reduce((acc, log) => acc + log.costINR, 0), [wasteLogs]);
  const totalQuantity = useMemo(() => wasteLogs.reduce((acc, log) => acc + log.quantity, 0), [wasteLogs]);

  // Most wasted item
  const mostWastedItem = useMemo(() => {
    if (wasteLogs.length === 0) {
      return { name: 'None recorded', cost: 0 };
    }
    const itemMap: Record<string, number> = {};
    wasteLogs.forEach(l => {
      itemMap[l.item] = (itemMap[l.item] || 0) + l.costINR;
    });
    let topItem = 'None recorded';
    let topVal = 0;
    Object.entries(itemMap).forEach(([item, val]) => {
      if (val > topVal) {
        topVal = val;
        topItem = item;
      }
    });
    return { name: topItem, cost: topVal };
  }, [wasteLogs]);

  // Pie chart: waste by reason
  const pieData = useMemo(() => {
    const reasonTotals: Record<string, number> = {};
    wasteLogs.forEach(l => {
      reasonTotals[l.reason] = (reasonTotals[l.reason] || 0) + l.costINR;
    });
    return Object.entries(reasonTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [wasteLogs]);

  // Trend chart: waste over time
  const trendData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    wasteLogs.forEach(l => {
      dateMap[l.date] = (dateMap[l.date] || 0) + l.costINR;
    });
    return Object.entries(dateMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, cost]) => ({
        date: date.slice(5),
        cost,
      }));
  }, [wasteLogs]);

  const handleExportWasteCSV = () => {
    const exportRows = wasteLogs.map(l => ({
      Date: l.date,
      Dish: l.item,
      Quantity: `${l.quantity} ${l.unit}`,
      Reason: l.reason,
      'Action Taken': l.actionTaken || 'Discarded',
      'Cost (INR)': l.costINR,
    }));
    exportToCSV('Actual_Kitchen_Waste_Audit_Log', exportRows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Actual Food Waste Tracking
            </h1>
            <span className="p-1 rounded-full bg-rose-50 text-rose-600">
              <Trash2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Log real-time kitchen shrinkage, binning events, and staff meals to continuously train forecast accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportWasteCSV}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
            title="Export Waste Logs to CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Actual Waste Event</span>
          </button>
        </div>
      </div>

      {/* AI Insight */}
      <AIInsight
        title="Waste Variance Feedback Loop"
        message="Logging actual kitchen waste automatically recalibrates tomorrow's batch prep sizing algorithms, adjusting safety buffers downward to protect operating margins."
        type="positive"
        impactBadge="Continuous Learning Active"
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Actual Waste Cost
          </span>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{formatINR(totalCost)}</p>
          <span className="text-[11px] text-slate-500">{wasteLogs.length} logged incidents</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Volume Discarded
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{totalQuantity} portions</p>
          <span className="text-[11px] text-slate-500">Across recorded shifts</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Highest Loss Dish
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1 truncate">{mostWastedItem.name}</p>
          <span className="text-[11px] text-rose-600 font-semibold">
            {formatINR(mostWastedItem.cost)} cumulative loss
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            Food Recovery & Staff Meal
          </span>
          <p className="text-xl font-extrabold text-emerald-800 mt-1">
            {wasteLogs.filter(l => l.actionTaken === 'Staff Meal' || l.actionTaken === 'Composted').length} Events
          </p>
          <span className="text-[11px] text-emerald-700">Diverted from landfill</span>
        </div>
      </div>

      {/* Charts: Breakdown & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <PieIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Waste Loss by Root Cause (₹)</span>
          </h2>
          {pieData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Trash2 className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No waste incidents recorded</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Waste logged in shift reconciliation or above will appear here in real time.</p>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={REASON_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [formatINR(val), 'Loss Cost']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <LineIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Daily Kitchen Shrinkage Trajectory (₹)</span>
          </h2>
          {trendData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <LineIcon className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No daily shrinkage trajectory</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Logs over subsequent dates will chart daily financial loss here.</p>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={val => `₹${val}`}
                  />
                  <Tooltip formatter={(val: number) => [formatINR(val), 'Waste Loss']} />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Main Waste Log Table Matching Requirement 14 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Official Kitchen Waste Audit Journal
          </h2>
          <span className="text-xs text-slate-500">Live synchronized with restaurant metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Dish</th>
                <th className="py-3.5 px-4 text-right">Quantity Wasted</th>
                <th className="py-3.5 px-4 text-center">Reason</th>
                <th className="py-3.5 px-4 text-center">Action Taken</th>
                <th className="py-3.5 px-4 text-right">Estimated Cost (₹)</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {wasteLogs.map(log => {
                const action = log.actionTaken || 'Discarded';
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {log.date}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.item}</td>

                    <td className="py-3.5 px-4 text-right font-bold text-rose-700">
                      {log.quantity} {log.unit}
                    </td>

                    {/* Reason: Overcooked, Customer Leftover, Expired, Spillage */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: REASON_COLORS[log.reason] || '#64748b' }}
                      >
                        {log.reason}
                      </span>
                    </td>

                    {/* Action Taken: Discarded, Staff Meal, Composted */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          action === 'Staff Meal'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : action === 'Composted'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatINR(log.costINR)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteWasteLog(log.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Logging Actual Waste Event (Requirement 14) */}
      {showLogModal && (
        <Modal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          title="Log Actual Food Waste Event"
          subtitle="Record discarded batches, overcooked portions, or staff allocations"
        >
          <form onSubmit={handleCreateLog} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Incident Date:</label>
              <input
                type="date"
                required
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Dish Name:</label>
              <select
                value={selectedItemName}
                onChange={e => handleDishChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {dishes.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity Wasted:</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={wasteQty}
                  onChange={e => handleQtyChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit:</label>
                <select
                  value={wasteUnit}
                  onChange={e => setWasteUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="portions">portions</option>
                  <option value="kg">kg</option>
                  <option value="L">liters</option>
                </select>
              </div>
            </div>

            {/* Reason: Overcooked, Customer Leftover, Expired, Spillage */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Waste Reason:</label>
              <select
                value={wasteReason}
                onChange={e => setWasteReason(e.target.value as WasteReason)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Overcooked">Overcooked (Burnt / Kitchen Preparation Error)</option>
                <option value="Customer Leftover">Customer Leftover (Table Plate Waste)</option>
                <option value="Expired">Expired (Perishable Storage Passed Safe Window)</option>
                <option value="Spillage">Spillage (Accidental Drop / Contamination)</option>
                <option value="Overproduction">Overproduction (Unsold End of Shift Surplus)</option>
                <option value="Damaged">Damaged Goods</option>
              </select>
            </div>

            {/* Action Taken: Discarded, Staff Meal, Composted */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Action Taken:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActionTaken('Discarded')}
                  className={`py-2 px-2 text-center rounded-xl font-bold border transition-all ${
                    actionTaken === 'Discarded'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 mx-auto mb-1 text-rose-500" />
                  Discarded
                </button>
                <button
                  type="button"
                  onClick={() => setActionTaken('Staff Meal')}
                  className={`py-2 px-2 text-center rounded-xl font-bold border transition-all ${
                    actionTaken === 'Staff Meal'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-500" />
                  Staff Meal
                </button>
                <button
                  type="button"
                  onClick={() => setActionTaken('Composted')}
                  className={`py-2 px-2 text-center rounded-xl font-bold border transition-all ${
                    actionTaken === 'Composted'
                      ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Recycle className="w-3.5 h-3.5 mx-auto mb-1 text-amber-500" />
                  Composted
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Cost Impact (₹):</label>
              <input
                type="number"
                min="0"
                required
                value={wasteCost}
                onChange={e => setWasteCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-extrabold text-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Confirm & Log Incident
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
