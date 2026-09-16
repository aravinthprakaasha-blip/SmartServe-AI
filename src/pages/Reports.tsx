import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PackageCheck,
  Trash2,
  CheckCircle2,
  BarChart3,
  Layers,
  Sparkles,
  Utensils,
  Award,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatINR, exportToCSV, formatNumber } from '../utils';
import { AIInsight } from '../components/common/AIInsight';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

type ReportTab = 'sales' | 'dishes' | 'inventory' | 'waste' | 'savings';
type DateRange = 'today' | '7days' | '30days' | 'all';

export const Reports: React.FC = () => {
  const { salesRecords, dishes, ingredients, wasteLogs } = useAppContext();

  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [dateRange, setDateRange] = useState<DateRange>('30days');

  // Filter sales records based on date range
  const filteredSales = useMemo(() => {
    const now = new Date();
    if (dateRange === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      return salesRecords.filter(s => s.date === todayStr);
    }
    if (dateRange === '7days') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return salesRecords.filter(s => new Date(s.date) >= past);
    }
    if (dateRange === '30days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return salesRecords.filter(s => new Date(s.date) >= past);
    }
    return salesRecords;
  }, [salesRecords, dateRange]);

  // 1. Daily Sales Report Data
  const dailySalesData = useMemo(() => {
    const map: Record<string, { date: string; sold: number; revenue: number; waste: number; records: number }> = {};
    filteredSales.forEach(s => {
      if (!map[s.date]) {
        map[s.date] = { date: s.date, sold: 0, revenue: 0, waste: 0, records: 0 };
      }
      map[s.date].sold += s.quantitySold;
      map[s.date].revenue += s.totalSales;
      map[s.date].waste += s.quantityWasted;
      map[s.date].records += 1;
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredSales]);

  // 2. Dish Performance Report Data
  const dishPerformanceData = useMemo(() => {
    const dishStats: Record<
      string,
      { name: string; category: string; price: number; unitsSold: number; totalRevenue: number; wastedUnits: number }
    > = {};

    dishes.forEach(d => {
      dishStats[d.name] = {
        name: d.name,
        category: d.category,
        price: d.priceINR,
        unitsSold: 0,
        totalRevenue: 0,
        wastedUnits: 0,
      };
    });

    filteredSales.forEach(s => {
      if (!dishStats[s.dishName]) {
        dishStats[s.dishName] = {
          name: s.dishName,
          category: 'Special',
          price: s.sellingPrice,
          unitsSold: 0,
          totalRevenue: 0,
          wastedUnits: 0,
        };
      }
      dishStats[s.dishName].unitsSold += s.quantitySold;
      dishStats[s.dishName].totalRevenue += s.totalSales;
      dishStats[s.dishName].wastedUnits += s.quantityWasted;
    });

    return Object.values(dishStats).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [dishes, filteredSales]);

  // 3. Inventory Consumption Report Data
  const inventoryReportData = useMemo(() => {
    return ingredients.map(ing => {
      const annualUsage = ing.dailyUsage * 365;
      const avgInventory = Math.max(1, ing.currentStock);
      const turnoverRatio = (annualUsage / avgInventory).toFixed(1);
      const holdingValue = ing.currentStock * ing.costPerUnitINR;
      return {
        ...ing,
        turnoverRatio: Number(turnoverRatio),
        holdingValue,
      };
    });
  }, [ingredients]);

  // 4. Waste Analysis Report Data
  const wasteAnalysisData = useMemo(() => {
    return wasteLogs.map(w => ({
      ...w,
      actionTaken: w.actionTaken || 'Discarded',
    }));
  }, [wasteLogs]);

  // 5. Cost Savings Summary Data
  const savingsData = useMemo(() => {
    return [
      { month: 'Apr', beforeAI: 48500, withAI: 41200, savings: 7300 },
      { month: 'May', beforeAI: 52000, withAI: 42100, savings: 9900 },
      { month: 'Jun', beforeAI: 54000, withAI: 41800, savings: 12200 },
      { month: 'Jul', beforeAI: 58000, withAI: 43200, savings: 14800 },
      { month: 'Aug', beforeAI: 61000, withAI: 44000, savings: 17000 },
      { month: 'Sep (MTD)', beforeAI: 64500, withAI: 45200, savings: 19300 },
    ];
  }, []);

  const totalCumulativeSavings = savingsData.reduce((acc, s) => acc + s.savings, 0);

  const handleExportCurrentReport = () => {
    if (activeTab === 'sales') {
      const rows = dailySalesData.map(d => ({
        Date: d.date,
        'Portions Sold': d.sold,
        'Revenue INR': d.revenue,
        'Portions Wasted': d.waste,
        'Recorded Entries': d.records,
      }));
      exportToCSV(`Daily_Sales_Report_${dateRange}`, rows);
    } else if (activeTab === 'dishes') {
      const rows = dishPerformanceData.map(d => ({
        Dish: d.name,
        Category: d.category,
        'Price INR': d.price,
        'Units Sold': d.unitsSold,
        'Gross Revenue INR': d.totalRevenue,
        'Wasted Units': d.wastedUnits,
      }));
      exportToCSV('Dish_Performance_Report', rows);
    } else if (activeTab === 'inventory') {
      const rows = inventoryReportData.map(i => ({
        Ingredient: i.name,
        Category: i.category,
        'Current Stock': `${i.currentStock} ${i.unit}`,
        'Daily Usage': `${i.dailyUsage} ${i.unit}`,
        'Holding Value INR': i.holdingValue,
        'Turnover Ratio': `${i.turnoverRatio}x`,
        Status: i.status,
      }));
      exportToCSV('Inventory_Consumption_Report', rows);
    } else if (activeTab === 'waste') {
      const rows = wasteAnalysisData.map(w => ({
        Date: w.date,
        Dish: w.item,
        Quantity: `${w.quantity} ${w.unit}`,
        Reason: w.reason,
        'Action Taken': w.actionTaken,
        'Cost INR': w.costINR,
      }));
      exportToCSV('Kitchen_Waste_Analysis_Report', rows);
    } else {
      exportToCSV('Cost_Savings_Summary_Report', savingsData);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Reports &amp; Operational Analytics
            </h1>
            <span className="p-1 rounded-full bg-slate-100 text-slate-700">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Downloadable audit reports covering sales performance, ingredient consumption, waste logs, and cost savings.
          </p>
        </div>

        {/* Action buttons: Export CSV & Print to PDF */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Export to PDF / Print</span>
          </button>

          <button
            type="button"
            onClick={handleExportCurrentReport}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* AI Insight */}
      <AIInsight
        title="Executive Summary & Savings"
        message={`Year-to-date AI batch sizing and real-time inventory management has yielded ${formatINR(totalCumulativeSavings)} in cumulative food cost savings.`}
        type="positive"
        impactBadge="ROI: 14.8x Payback"
      />

      {/* 5 Core Report Tabs as specified in Requirement 15 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sales'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Sales Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dishes')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'dishes'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dish Performance Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventory Consumption Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('waste')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'waste'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Waste Analysis Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('savings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'savings'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cost Savings Summary
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Period:</span>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as DateRange)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* REPORT 1: Daily Sales Report */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daily Sales Audit Journal</h2>
              <p className="text-xs text-slate-500">
                Aggregated daily volume, revenue, and shrinkage from live staff entries
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">
              {dailySalesData.length} active service days
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Portions Sold</th>
                  <th className="py-3.5 px-4 text-right">Gross Sales (₹)</th>
                  <th className="py-3.5 px-4 text-right">Portions Wasted</th>
                  <th className="py-3.5 px-4 text-center">Entry Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {dailySalesData.map(row => (
                  <tr key={row.date} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.date}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {row.sold} portions
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">
                      {formatINR(row.revenue)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                      {row.waste} portions
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500">
                      {row.records} shifts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: Dish Performance Report */}
      {activeTab === 'dishes' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Menu Dish Performance Audit</h2>
              <p className="text-xs text-slate-500">
                Sorted by cumulative gross sales revenue and units served
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">
              {dishPerformanceData.length} menu dishes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Dish Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Selling Price (₹)</th>
                  <th className="py-3.5 px-4 text-right">Units Sold</th>
                  <th className="py-3.5 px-4 text-right">Gross Revenue (₹)</th>
                  <th className="py-3.5 px-4 text-right">Wasted Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {dishPerformanceData.map(dish => (
                  <tr key={dish.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{dish.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{dish.category}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {formatINR(dish.price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-indigo-900">
                      {dish.unitsSold}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">
                      {formatINR(dish.totalRevenue)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                      {dish.wastedUnits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: Inventory Consumption Report */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Inventory Consumption & Velocity</h2>
              <p className="text-xs text-slate-500">
                Daily burn rates, warehouse valuation, and stock status
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">
              {inventoryReportData.length} raw ingredients
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ingredient</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Current Stock</th>
                  <th className="py-3.5 px-4 text-right">Daily Usage</th>
                  <th className="py-3.5 px-4 text-right">Holding Value (₹)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {inventoryReportData.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{item.category}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                      {item.dailyUsage} {item.unit}/day
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatINR(item.holdingValue)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: Waste Analysis Report */}
      {activeTab === 'waste' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Kitchen Food Waste Audit Journal</h2>
              <p className="text-xs text-slate-500">
                Itemized breakdown of discarded or repurposed food
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-600">
              {wasteAnalysisData.length} logged incidents
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Dish</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                  <th className="py-3.5 px-4 text-center">Reason</th>
                  <th className="py-3.5 px-4 text-center">Action Taken</th>
                  <th className="py-3.5 px-4 text-right">Estimated Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {wasteAnalysisData.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600">{log.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.item}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {log.quantity} {log.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                        {log.reason}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.actionTaken}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      {formatINR(log.costINR)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 5: Cost Savings Summary */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cumulative Savings Realized
              </span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                {formatINR(totalCumulativeSavings)}
              </p>
              <span className="text-[11px] text-slate-500">Since AI deployment</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Average Monthly Reduction
              </span>
              <p className="text-2xl font-extrabold text-indigo-700 mt-1">
                {formatINR(Math.round(totalCumulativeSavings / savingsData.length))}
              </p>
              <span className="text-[11px] text-slate-500">In avoidable shrinkage</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                COGS Efficiency Gain
              </span>
              <p className="text-2xl font-extrabold text-teal-700 mt-1">+23.4%</p>
              <span className="text-[11px] text-slate-500">Margin preservation</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              Monthly Kitchen Operating Costs (Before AI vs. With AI Optimization)
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={val => `₹${val}`}
                  />
                  <Tooltip formatter={(val: number) => [formatINR(val)]} />
                  <Legend />
                  <Bar dataKey="beforeAI" name="Standard Sizing (₹)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withAI" name="AI Precision Sizing (₹)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
