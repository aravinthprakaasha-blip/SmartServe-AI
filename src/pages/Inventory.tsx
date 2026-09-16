import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Minus,
  Sliders,
  AlertTriangle,
  Edit2,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Package,
  IndianRupee,
  Truck,
  PlusCircle,
  MinusCircle,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Ingredient, StockStatus } from '../types';
import { getStockStatusBadgeClass, formatINR } from '../utils';
import { AIInsight } from '../components/common/AIInsight';
import { Modal } from '../components/common/Modal';

type AdjustmentType = 'add' | 'deduct' | 'manual';

const DEFAULT_SUPPLIERS: Record<string, string> = {
  'ing-1': 'Metro Cash & Carry / KR Mills',
  'ing-2': 'Deccan Fresh Halal Broilers',
  'ing-3': 'Aavin Co-operative Dairy',
  'ing-4': 'Malabar Spice Traders',
  'ing-5': 'Royal Meat Distributors',
  'ing-6': 'Koyambedu Agricultural Mandi',
  'ing-7': 'Bangalore Wholesale Mart',
  'ing-8': 'Adani Wilmar Logistics',
  'ing-9': 'Aashirvaad Mill Supply',
  'ing-10': 'Heritage Dairy Hub',
  'ing-11': 'Assam Tea Exporters Co.',
  'ing-12': 'Sultan Coffee Estate',
};

export const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { ingredients, updateIngredientStock } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [activeItem, setActiveItem] = useState<Ingredient | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(5);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('New Shipment Arrival');

  const categories = useMemo(() => {
    return Array.from(new Set(ingredients.map(i => i.category)));
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supplier || DEFAULT_SUPPLIERS[item.id] || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchSearch && matchStatus && matchCat;
    });
  }, [ingredients, searchQuery, selectedStatus, selectedCategory]);

  const handleOpenAction = (item: Ingredient, type: AdjustmentType) => {
    setActiveItem(item);
    setAdjustmentType(type);
    if (type === 'manual') {
      setAdjustmentAmount(item.currentStock);
      setAdjustmentReason('Physical Inventory Audit');
    } else if (type === 'add') {
      setAdjustmentAmount(10);
      setAdjustmentReason('Supplier Delivery Received');
    } else {
      setAdjustmentAmount(5);
      setAdjustmentReason('Kitchen Usage / Prep Batch');
    }
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    let targetStock = activeItem.currentStock;
    if (adjustmentType === 'add') {
      targetStock = activeItem.currentStock + Math.max(0, adjustmentAmount);
    } else if (adjustmentType === 'deduct') {
      targetStock = Math.max(0, activeItem.currentStock - Math.max(0, adjustmentAmount));
    } else if (adjustmentType === 'manual') {
      targetStock = Math.max(0, adjustmentAmount);
    }

    updateIngredientStock(activeItem.id, Math.round(targetStock * 10) / 10);
    setActiveItem(null);
  };

  // Inventory value & critical metrics
  const totalValue = ingredients.reduce((sum, i) => sum + i.currentStock * i.costPerUnitINR, 0);
  const criticalCount = ingredients.filter(i => i.status === 'Critical').length;
  const lowStockCount = ingredients.filter(i => i.status === 'Low Stock').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Raw Ingredient Inventory Management
            </h1>
            <span className="p-1 rounded-full bg-emerald-50 text-emerald-600">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time stock monitoring with automatic recipe deductions upon sales data entry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/smart-purchasing')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Generate Purchase Orders</span>
          </button>
        </div>
      </div>

      {/* AI Insight */}
      <AIInsight
        title="Automated Depletion Tracking"
        message="Every portion sold through Quick Entry or Today's Data immediately deducts raw ingredients (chicken, basmati rice, spices, ghee) using programmed recipe portioning ratios."
        type="positive"
        impactBadge="Live Recipe Synchronization Active"
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Inventory Value
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{formatINR(totalValue)}</p>
          <span className="text-[11px] text-slate-500">{ingredients.length} raw ingredients</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
            Critical Depletion Alert
          </span>
          <p className="text-xl font-extrabold text-rose-700 mt-1">{criticalCount} Items</p>
          <span className="text-[11px] text-rose-600">&lt; 1 day stock buffer</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Low Stock Watchlist
          </span>
          <p className="text-xl font-extrabold text-amber-800 mt-1">{lowStockCount} Items</p>
          <span className="text-[11px] text-amber-700">Approaching reorder point</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Smart Procurement
          </span>
          <p className="text-xl font-extrabold text-indigo-700 mt-1">
            {criticalCount + lowStockCount} Needed
          </p>
          <button
            onClick={() => navigate('/smart-purchasing')}
            className="text-[11px] font-bold text-indigo-600 hover:underline"
          >
            Review Purchase List &rarr;
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ingredient or supplier..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="Critical">Critical</option>
              <option value="Low Stock">Low Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Overstocked">Overstocked</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
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
        </div>
      </div>

      {/* Main Inventory Table Required By Requirement 9 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Ingredient Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Daily Required</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Cost (₹)</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredIngredients.map(item => {
                const supplierName = item.supplier || DEFAULT_SUPPLIERS[item.id] || 'Direct Wholesale Mandi';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>
                        <span>{item.name}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Min threshold: {item.minStockLevel} {item.unit}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">{item.category}</td>

                    {/* Current Stock */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-sm font-extrabold text-slate-900">
                        {item.currentStock}
                      </span>{' '}
                      <span className="text-[11px] text-slate-500 font-normal">{item.unit}</span>
                    </td>

                    {/* Daily Required */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {item.dailyUsage} {item.unit}/day
                    </td>

                    {/* Status (In Stock / Low Stock / Critical) */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStockStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Cost (₹) */}
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                      {formatINR(item.costPerUnitINR)}/{item.unit}
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px] font-medium">{supplierName}</span>
                      </div>
                    </td>

                    {/* Buttons: Add Stock, Deduct Stock, Manual Adjustment */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(item, 'add')}
                          title="Add Stock"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAction(item, 'deduct')}
                          title="Deduct Stock"
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAction(item, 'manual')}
                          title="Manual Adjustment"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors text-[10px] font-semibold flex items-center gap-0.5 px-2"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Adjust</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal (Add / Deduct / Manual) */}
      {activeItem && (
        <Modal
          isOpen={!!activeItem}
          onClose={() => setActiveItem(null)}
          title={
            adjustmentType === 'add'
              ? `Add Stock: ${activeItem.name}`
              : adjustmentType === 'deduct'
              ? `Deduct Stock: ${activeItem.name}`
              : `Manual Count Audit: ${activeItem.name}`
          }
          subtitle={`Current stock: ${activeItem.currentStock} ${activeItem.unit}`}
        >
          <form onSubmit={handleSaveAdjustment} className="space-y-4">
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  adjustmentType === 'add' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                + Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('deduct')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  adjustmentType === 'deduct' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                - Deduct Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('manual')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  adjustmentType === 'manual' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Manual Set
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {adjustmentType === 'manual'
                  ? `New Verified Balance (${activeItem.unit}):`
                  : adjustmentType === 'add'
                  ? `Quantity to Receive & Add (${activeItem.unit}):`
                  : `Quantity to Deduct (${activeItem.unit}):`}
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                required
                value={adjustmentAmount}
                onChange={e => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason / Note:
              </label>
              <input
                type="text"
                value={adjustmentReason}
                onChange={e => setAdjustmentReason(e.target.value)}
                placeholder="e.g. Received weekly consignment, chef audit, spoilage deduction"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Projected Result: </span>
              <span className="font-bold text-indigo-700">
                {adjustmentType === 'add'
                  ? `${activeItem.currentStock} + ${adjustmentAmount} = ${Math.round((activeItem.currentStock + adjustmentAmount) * 10) / 10} ${activeItem.unit}`
                  : adjustmentType === 'deduct'
                  ? `${activeItem.currentStock} - ${adjustmentAmount} = ${Math.max(0, Math.round((activeItem.currentStock - adjustmentAmount) * 10) / 10)} ${activeItem.unit}`
                  : `${adjustmentAmount} ${activeItem.unit}`}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Apply & Recalculate
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
