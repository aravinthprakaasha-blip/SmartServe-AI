import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Sparkles,
  Download,
  FileCheck,
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building,
  DollarSign,
  Receipt,
  PackageCheck,
  Truck,
  Check,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import {
  predictIngredientRequirement,
  generatePurchasePlan,
} from '../services/forecastService';
import { PurchaseRecommendation, PurchasePriority } from '../types';
import { formatINR, getPurchasePriorityBadgeClass, exportToCSV } from '../utils';
import { AIInsight } from '../components/common/AIInsight';
import { Modal } from '../components/common/Modal';

interface PurchaseItemState extends PurchaseRecommendation {
  orderStatus: 'Suggested' | 'Ordered' | 'Received';
  orderDate?: string;
  poNumber?: string;
}

export const SmartPurchasing: React.FC = () => {
  const { ingredients, dishes, updateIngredientStock } = useAppContext();

  const [isGenerating, setIsGenerating] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Purchase items state with lifecycle: Suggested -> Ordered -> Received
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemState[]>(() => {
    const reqs = predictIngredientRequirement(dishes, ingredients);
    const plan = generatePurchasePlan(ingredients, reqs);
    return plan.map(item => ({
      ...item,
      orderStatus: 'Suggested',
    }));
  });

  // Modal for "Generate Purchase Order"
  const [createdOrderModal, setCreatedOrderModal] = useState<boolean>(false);
  const [generatedPONumber, setGeneratedPONumber] = useState<string>('');

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const reqs = predictIngredientRequirement(dishes, ingredients);
      const plan = generatePurchasePlan(ingredients, reqs);
      setPurchaseItems(
        plan.map(item => ({
          ...item,
          orderStatus: 'Suggested',
        }))
      );
      setIsGenerating(false);
    }, 500);
  };

  const handleMarkAsOrdered = (itemId: string) => {
    setPurchaseItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              orderStatus: 'Ordered',
              orderDate: new Date().toLocaleDateString(),
              poNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
            }
          : item
      )
    );
  };

  const handleReceiveStock = (item: PurchaseItemState) => {
    // Automatically add stock to inventory
    const existingIngredient = ingredients.find(ing => ing.id === item.ingredientId);
    if (existingIngredient) {
      const newStock = Math.round((existingIngredient.currentStock + item.requiredPurchaseQuantity) * 10) / 10;
      updateIngredientStock(item.ingredientId, newStock);
    }

    // Mark as Received
    setPurchaseItems(prev =>
      prev.map(p => (p.id === item.id ? { ...p, orderStatus: 'Received' } : p))
    );
  };

  const handleOpenCreatePO = () => {
    const poNum = `PO-RESTO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedPONumber(poNum);
    setCreatedOrderModal(true);
  };

  const handleConfirmAllOrdered = () => {
    setPurchaseItems(prev =>
      prev.map(p =>
        p.orderStatus === 'Suggested'
          ? {
              ...p,
              orderStatus: 'Ordered',
              orderDate: new Date().toLocaleDateString(),
              poNumber: generatedPONumber,
            }
          : p
      )
    );
    setCreatedOrderModal(false);
  };

  const filteredPlan = useMemo(() => {
    if (priorityFilter === 'all') return purchaseItems;
    return purchaseItems.filter(p => p.priority === priorityFilter);
  }, [purchaseItems, priorityFilter]);

  const totalEstimatedCost = filteredPlan.reduce((acc, p) => acc + p.estimatedCostINR, 0);

  const handleExportCSV = () => {
    const dataToExport = purchaseItems.map(p => ({
      Ingredient: p.ingredientName,
      'Suggested Purchase Quantity': `${p.requiredPurchaseQuantity} ${p.unit}`,
      'Estimated Cost INR': p.estimatedCostINR,
      Supplier: p.supplier,
      Priority: p.priority,
      Status: p.orderStatus,
    }));
    exportToCSV('RestoAI_Smart_Purchase_Plan', dataToExport);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              AI Smart Purchasing & Procurement
            </h1>
            <span className="p-1 rounded-full bg-emerald-50 text-emerald-600">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated purchase orders sized to replenishment needs. Receiving orders updates physical inventory instantly.
          </p>
        </div>

        {/* Buttons: Generate Purchase Order, Regenerate Plan, Export CSV */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors ${
              isGenerating ? 'opacity-70' : ''
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Recalculating...' : 'Refresh Suggestions'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreatePO}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
          >
            <FileCheck className="w-4 h-4" />
            <span>Generate Purchase Order</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
            title="Download CSV Procurement Sheet"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Insight */}
      <AIInsight
        title="Predictive Economic Order Sizing"
        message="Order requirements account for today's forecast + 3-day safety buffers. Clicking 'Receive Stock' immediately credits the warehouse balance and resets low stock alerts."
        type="action"
        impactBadge="End-to-End Inventory Sync"
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Suggested Procurements
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{purchaseItems.length} Line Items</p>
          <span className="text-[11px] text-slate-500">
            {purchaseItems.filter(p => p.orderStatus === 'Ordered').length} in transit •{' '}
            {purchaseItems.filter(p => p.orderStatus === 'Received').length} received
          </span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
            High Priority Replenishments
          </span>
          <p className="text-2xl font-bold text-rose-800 mt-1">
            {purchaseItems.filter(p => p.priority === 'HIGH').length} Critical
          </p>
          <span className="text-[11px] text-rose-600">Immediate action needed</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            Total Estimated Purchase Value
          </span>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            {formatINR(totalEstimatedCost)}
          </p>
          <span className="text-[11px] text-emerald-700">Estimated wholesale cost</span>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span>Filter Priority:</span>
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={() => setPriorityFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  priorityFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({purchaseItems.length})
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('HIGH')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  priorityFilter === 'HIGH'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                HIGH ({purchaseItems.filter(p => p.priority === 'HIGH').length})
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('MEDIUM')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  priorityFilter === 'MEDIUM'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                MEDIUM ({purchaseItems.filter(p => p.priority === 'MEDIUM').length})
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('LOW')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  priorityFilter === 'LOW'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                LOW ({purchaseItems.filter(p => p.priority === 'LOW').length})
              </button>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Delivery window: <strong>Standard Morning Logistics</strong>
          </span>
        </div>

        {/* Table matching Requirement 12 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4 text-right">Suggested Purchase Quantity</th>
                <th className="py-3.5 px-4 text-right">Estimated Cost (₹)</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Procurement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPlan.map(item => {
                const isOrdered = item.orderStatus === 'Ordered';
                const isReceived = item.orderStatus === 'Received';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isReceived ? 'bg-emerald-50/20' : isOrdered ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    {/* Item Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>
                        <span>{item.ingredientName}</span>
                        <span className="block text-[10px] font-normal text-slate-400">
                          Current: {item.currentStock} {item.unit}
                        </span>
                      </div>
                    </td>

                    {/* Suggested Purchase Quantity */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-sm font-extrabold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        {item.requiredPurchaseQuantity} {item.unit}
                      </span>
                    </td>

                    {/* Estimated Cost (₹) */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatINR(item.estimatedCostINR)}
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {item.supplier}
                      </span>
                    </td>

                    {/* Priority (High / Medium / Low) */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPurchasePriorityBadgeClass(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="py-3.5 px-4 text-center">
                      {isReceived ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          Received
                        </span>
                      ) : isOrdered ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                          <Truck className="w-3 h-3" />
                          Ordered
                        </span>
                      ) : (
                        <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          Suggested
                        </span>
                      )}
                    </td>

                    {/* Action buttons: Mark as Ordered, Receive Stock */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {item.orderStatus === 'Suggested' && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsOrdered(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition-colors"
                          >
                            Mark as Ordered
                          </button>
                        )}

                        {item.orderStatus === 'Ordered' && (
                          <button
                            type="button"
                            onClick={() => handleReceiveStock(item)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Receive Stock</span>
                          </button>
                        )}

                        {item.orderStatus === 'Received' && (
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            Added to Inventory
                          </span>
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

      {/* Generated PO Modal */}
      {createdOrderModal && (
        <Modal
          isOpen={createdOrderModal}
          onClose={() => setCreatedOrderModal(false)}
          title={`Generate Purchase Order: ${generatedPONumber}`}
          subtitle="Review and dispatch all pending suggested line items to vendors"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-bold text-slate-900">{generatedPONumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Line Items:</span>
                <span className="font-bold text-slate-900">{purchaseItems.length} ingredients</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-indigo-700">
                <span>Total PO Amount:</span>
                <span>{formatINR(totalEstimatedCost)}</span>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {purchaseItems.map(item => (
                <div key={item.id} className="p-3 flex items-center justify-between bg-white">
                  <div>
                    <p className="font-bold text-slate-800">{item.ingredientName}</p>
                    <p className="text-[11px] text-slate-400">{item.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {item.requiredPurchaseQuantity} {item.unit}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-600">
                      {formatINR(item.estimatedCostINR)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreatedOrderModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAllOrdered}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Confirm & Mark All as Ordered
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
