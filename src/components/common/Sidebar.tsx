import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  UtensilsCrossed,
  ChefHat,
  Radio,
  CloudSun,
  Boxes,
  Layers,
  ShoppingCart,
  Trash2,
  ClipboardList,
  FileBarChart,
  Settings,
  Sparkles,
  X,
  Store,
  Compass,
  PenTool,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigationGroups: NavGroup[] = [
    {
      groupTitle: 'Operations & Real-Time',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        {
          name: "Enter Today's Data",
          path: '/sales-entry',
          icon: PenTool,
          badge: 'Live Entry',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
        },
        {
          name: 'Real-Time Forecast',
          path: '/real-time',
          icon: Radio,
          badge: 'Live',
          badgeColor: 'bg-rose-100 text-rose-700 animate-pulse',
        },
      ],
    },
    {
      groupTitle: 'Demand & Kitchen Ops',
      items: [
        {
          name: 'Demand Forecasting',
          path: '/forecasting',
          icon: TrendingUp,
          badge: 'AI Core',
          badgeColor: 'bg-indigo-100 text-indigo-700',
        },
        { name: 'Dish Predictions', path: '/dish-predictions', icon: UtensilsCrossed },
        {
          name: 'Preparation Plan',
          path: '/preparation-planning',
          icon: ChefHat,
          badge: 'Daily',
          badgeColor: 'bg-amber-100 text-amber-700',
        },
        { name: 'Weather & Events', path: '/weather-events', icon: CloudSun },
      ],
    },
    {
      groupTitle: 'Inventory & Purchasing',
      items: [
        {
          name: 'Inventory Management',
          path: '/inventory',
          icon: Boxes,
        },
        { name: 'Ingredient Forecasting', path: '/ingredient-forecasting', icon: Layers },
        {
          name: 'Smart Purchasing',
          path: '/smart-purchasing',
          icon: ShoppingCart,
          badge: 'Auto PO',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        },
      ],
    },
    {
      groupTitle: 'Waste & Analytics',
      items: [
        { name: 'Food Waste Prediction', path: '/waste-prediction', icon: Trash2 },
        { name: 'Waste Tracking', path: '/waste-tracking', icon: ClipboardList },
        { name: 'Reports', path: '/reports', icon: FileBarChart },
      ],
    },
    {
      groupTitle: 'System',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/40">
          <NavLink
            to="/dashboard"
            onClick={() => onClose()}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Resto<span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5">
                Demand & Inventory Ops
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          {navigationGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {group.groupTitle}
              </h3>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose()}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-xs ring-1 ring-indigo-500/10'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-indigo-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            item.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom AI Status Card */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/60">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Forecast Model v4.2
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                94% Acc
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Syncing order streams with Bangalore weather and regional festival patterns.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
