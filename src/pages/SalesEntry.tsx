import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PenTool,
  Save,
  Trash2,
  RefreshCw,
  PlusCircle,
  Clock,
  Calendar,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Boxes,
  ArrowDownRight,
  Sparkles,
  Edit2,
  Search,
  Filter,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MealPeriod, SalesRecord } from '../types';
import { formatINR } from '../utils';

interface OutletContextType {
  triggerToast?: (msg: string) => void;
}

export const SalesEntry: React.FC = () => {
  const {
    dishes,
    salesRecords,
    addSalesRecord,
    updateSalesRecord,
    deleteSalesRecord,
    hasDemoData,
    clearDemoData,
    loadDemoData,
  } = useAppContext();

  const outletCtx = useOutletContext<OutletContextType>();
  const triggerToast = outletCtx?.triggerToast || ((msg: string) => alert(msg));

  // Determine current meal period from hour
  const currentHour = new Date().getHours();
  let defaultMeal: MealPeriod = 'Lunch';
  if (currentHour < 11) defaultMeal = 'Morning';
  else if (currentHour >= 11 && currentHour < 16) defaultMeal = 'Lunch';
  else if (currentHour >= 16 && currentHour < 19) defaultMeal = 'Evening';
  else defaultMeal = 'Dinner';

  const defaultDate = new Date().toISOString().split('T')[0];
  const defaultTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Form State
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(defaultDate);
  const [time, setTime] = useState<string>(defaultTime);
  const [dishId, setDishId] = useState<string>(dishes[0]?.id || 'dish-1');
  const [prepared, setPrepared] = useState<number>(200);
  const [sold, setSold] = useState<number>(145);
  const [wasted, setWasted] = useState<number>(12);
  const [mealPeriod, setMealPeriod] = useState<MealPeriod>(defaultMeal);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  // Filters for Table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMeal, setFilterMeal] = useState<string>('All');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastDeductions, setLastDeductions] = useState<{ ingredientName: string; usedAmount: number; unit: string }[]>([]);

  const selectedDish = dishes.find(d => d.id === dishId) || dishes[0];
  const activePrice = customPrice !== null ? customPrice : (selectedDish?.priceINR || 250);
  const remaining = Math.max(0, prepared - sold - wasted);
  const totalSalesINR = sold * activePrice;

  // Recipe usage preview for the entered portions
  const previewRecipeUsages = selectedDish?.ingredients?.map(usage => {
    const qty = Math.round(usage.quantityPerPortion * sold * 100) / 100;
    return {
      ingredientId: usage.ingredientId,
      qty,
    };
  }) || [];

  const handleDishChange = (newDishId: string) => {
    setDishId(newDishId);
    const newDish = dishes.find(d => d.id === newDishId);
    if (newDish) {
      setCustomPrice(newDish.priceINR);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (sold > prepared) {
      setFormError(`Sold count (${sold}) cannot exceed prepared quantity (${prepared}).`);
      return;
    }

    if (sold + wasted > prepared) {
      setFormError(`Sold (${sold}) + Wasted (${wasted}) exceeds prepared count (${prepared}).`);
      return;
    }

    setFormError(null);

    if (editingRecordId) {
      // Update existing record
      updateSalesRecord(editingRecordId, {
        date,
        time,
        dishId: selectedDish.id,
        dishName: selectedDish.name,
        quantityPrepared: Number(prepared),
        quantitySold: Number(sold),
        quantityRemaining: remaining,
        quantityWasted: Number(wasted),
        mealPeriod,
        sellingPrice: activePrice,
      });

      triggerToast(`Sales record updated for ${selectedDish.name}`);
      setSuccessBanner(`Record updated: ${selectedDish.name} (Sold: ${sold}, Total: ₹${totalSalesINR.toLocaleString()})`);
      clearForm();
    } else {
      // Add new record
      const deductions = addSalesRecord({
        date,
        time,
        dishId: selectedDish.id,
        dishName: selectedDish.name,
        quantityPrepared: Number(prepared),
        quantitySold: Number(sold),
        quantityRemaining: remaining,
        quantityWasted: Number(wasted),
        mealPeriod,
        sellingPrice: activePrice,
        isDemo: false,
      });

      setLastDeductions(deductions);
      const deductionMsg = deductions.length > 0
        ? `Inventory automatically updated: deducted ${deductions.map(d => `${d.usedAmount} ${d.unit} of ${d.ingredientName}`).slice(0, 3).join(', ')}.`
        : 'Demand forecast and kitchen plans refreshed.';

      triggerToast(`Live record saved! ${deductionMsg}`);
      setSuccessBanner(`Saved: ${sold} plates of ${selectedDish.name} billed. ${deductionMsg}`);
      clearForm();
    }
  };

  const handleEditClick = (record: SalesRecord) => {
    setEditingRecordId(record.id);
    setDate(record.date);
    setTime(record.time);
    setDishId(record.dishId);
    setPrepared(record.quantityPrepared);
    setSold(record.quantitySold);
    setWasted(record.quantityWasted);
    setMealPeriod(record.mealPeriod);
    setCustomPrice(record.sellingPrice);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string, dishName: string) => {
    deleteSalesRecord(id);
    triggerToast(`Sales record deleted for ${dishName}`);
    if (editingRecordId === id) {
      clearForm();
    }
  };

  const clearForm = () => {
    setEditingRecordId(null);
    setDate(defaultDate);
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setPrepared(200);
    setSold(145);
    setWasted(12);
    setMealPeriod(defaultMeal);
    setCustomPrice(null);
    setFormError(null);
  };

  // Filter sales records for today's table
  const filteredRecords = salesRecords.filter(record => {
    const matchesSearch =
      record.dishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.mealPeriod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.time.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMeal =
      filterMeal === 'All' || record.mealPeriod.toLowerCase() === filterMeal.toLowerCase();

    return matchesSearch && matchesMeal;
  });

  // Today totals across all entered records
  const todayPrepared = salesRecords.reduce((acc, r) => acc + r.quantityPrepared, 0);
  const todaySold = salesRecords.reduce((acc, r) => acc + r.quantitySold, 0);
  const todayRemaining = salesRecords.reduce((acc, r) => acc + r.quantityRemaining, 0);
  const todayWasted = salesRecords.reduce((acc, r) => acc + r.quantityWasted, 0);
  const todayRevenue = salesRecords.reduce((acc, r) => acc + r.totalSales, 0);
  const wastePercent = todayPrepared > 0 ? Math.round((todayWasted / todayPrepared) * 1000) / 10 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Enter Today's Data (Sales & Kitchen Service)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Log actual service metrics throughout the day to drive real-time inventory deduction & AI forecasting
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasDemoData ? (
            <button
              type="button"
              onClick={() => {
                clearDemoData();
                triggerToast('Demo baseline cleared. Ready for your actual restaurant records.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Clear Demo Data</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                loadDemoData();
                triggerToast('Loaded realistic demo restaurant baseline.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Demo Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Operational Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Today's Revenue</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">{formatINR(todayRevenue)}</span>
          <span className="text-[10px] text-emerald-600 font-medium">Live billed sales</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Portions Sold</span>
          <span className="text-lg font-bold text-indigo-600 mt-1 block">{todaySold} plates</span>
          <span className="text-[10px] text-slate-400">Total customer orders</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Food Prepared</span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">{todayPrepared} plates</span>
          <span className="text-[10px] text-slate-400">Total batch yield</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Remaining Food</span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">{todayRemaining} plates</span>
          <span className="text-[10px] text-slate-400">On-hand in hot holding</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Food Wasted</span>
          <span className="text-lg font-bold text-rose-600 mt-1 block">{todayWasted} plates</span>
          <span className="text-[10px] text-rose-500 font-medium">{wastePercent}% of prep</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Entries Count</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">{salesRecords.length} records</span>
          <span className="text-[10px] text-indigo-600 font-medium">Logged today</span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">{successBanner}</span>
            <span className="text-emerald-700 text-[11px] mt-0.5 block">
              The main dashboard, demand charts, dish predictions, recipe deductions, and kitchen prep plans have immediately updated.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Entry Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {editingRecordId ? 'Update Service Record' : 'Record Service Sales & Kitchen Batch'}
            </h2>
          </div>
          {editingRecordId && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
              Editing Record ID: {editingRecordId}
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <span className="font-semibold">{formError}</span>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-rose-500 hover:text-rose-800 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time of Service</span>
              </label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="e.g. 12:30 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Dish Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
                <span>Dish / Menu Item</span>
              </label>
              <select
                value={dishId}
                onChange={e => handleDishChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                {dishes.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — ₹{d.priceINR} ({d.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Meal Period */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Meal Period
              </label>
              <select
                value={mealPeriod}
                onChange={e => setMealPeriod(e.target.value as MealPeriod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                <option value="Morning">Breakfast (Morning)</option>
                <option value="Lunch">Lunch</option>
                <option value="Evening">Evening Snacks</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
          </div>

          {/* Operational Quantities & Pricing */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity Prepared
              </label>
              <input
                type="number"
                min="0"
                value={prepared}
                onChange={e => setPrepared(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
              <span className="text-[10px] text-slate-400">Total batch created</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-800 mb-1">
                Quantity Sold
              </label>
              <input
                type="number"
                min="0"
                value={sold}
                onChange={e => setSold(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-indigo-300 text-sm font-bold text-indigo-700 bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500"
                required
              />
              <span className="text-[10px] text-indigo-600 font-medium">Billed to patrons</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity Remaining
              </label>
              <input
                type="number"
                readOnly
                value={remaining}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-100 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">Prepared - Sold - Wasted</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-700 mb-1">
                Quantity Wasted
              </label>
              <input
                type="number"
                min="0"
                value={wasted}
                onChange={e => setWasted(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 text-sm font-bold text-rose-600 focus:ring-2 focus:ring-rose-500 bg-white"
                required
              />
              <span className="text-[10px] text-rose-500">Spoiled / Overproduced</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                min="1"
                value={activePrice}
                onChange={e => setCustomPrice(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
              <span className="text-[10px] text-emerald-600 font-medium">Revenue: ₹{totalSalesINR.toLocaleString()}</span>
            </div>
          </div>

          {/* Automatic Recipe Ingredient Deduction Live Preview */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-indigo-950">Recipe Consumption Preview for {sold} portions: </span>
                <span className="text-indigo-800">
                  {selectedDish?.name} will deduct ingredients from live inventory upon saving.
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[11px] block">Calculated via Bill-of-Materials:</span>
              <span className="font-mono font-bold text-indigo-700">
                1 plate consumes standard recipe quantities
              </span>
            </div>
          </div>

          {/* Buttons: Save Record, Update Record, Delete Record, Clear Form */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearForm}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Clear Form
              </button>

              {editingRecordId && (
                <button
                  type="button"
                  onClick={() => handleDeleteClick(editingRecordId, selectedDish?.name || 'Item')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editingRecordId ? (
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Update Record</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/25 transition-all hover:scale-102"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Data & Deduct Inventory</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Table of Today's Records */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Entered Sales & Service Records</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredRecords.length} records. Click any row or edit button to update.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search dish or time..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>

            {/* Meal Filter */}
            <select
              value={filterMeal}
              onChange={e => setFilterMeal(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Meal Periods</option>
              <option value="Morning">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Evening">Evening</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4 text-center">Prepared</th>
                <th className="py-3 px-4 text-center text-indigo-700 font-bold">Sold</th>
                <th className="py-3 px-4 text-center">Remaining</th>
                <th className="py-3 px-4 text-center text-rose-600">Waste</th>
                <th className="py-3 px-4">Meal Period</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right font-bold">Total Sales</th>
                <th className="py-3 px-4 text-center">Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No sales records found. Use the form above to enter today's first service batch!
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      editingRecordId === rec.id ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                      {rec.time}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{rec.dishName}</span>
                      <span className="text-[10px] text-slate-400">{rec.date}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      {rec.quantityPrepared}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600 bg-indigo-50/30">
                      {rec.quantitySold}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-600">
                      {rec.quantityRemaining}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-rose-600">
                      {rec.quantityWasted}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        {rec.mealPeriod === 'Morning' ? 'Breakfast' : rec.mealPeriod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      ₹{rec.sellingPrice}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      ₹{rec.totalSales.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {rec.isDemo ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Demo Data
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Live Input
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditClick(rec)}
                          className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(rec.id, rec.dishName)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
