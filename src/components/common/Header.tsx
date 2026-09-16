import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  Store,
  CheckCircle2,
  AlertTriangle,
  Menu,
  ShieldCheck,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { formatDate, getGreeting } from '../../utils';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onGlobalRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onGlobalRefresh,
  isRefreshing = false,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Indiranagar Flagship Kitchen');
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  const handleSignOut = async () => {
    setShowProfile(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Staff Member';
  const userInitials = (userDisplayName.substring(0, 2) || 'RA').toUpperCase();

  const notifications = [
    {
      id: 1,
      title: 'Critical Stock Alert',
      desc: 'Tender Mutton stock is 14 kg (less than 0.8 days left). Auto purchase order draft ready.',
      time: '12 min ago',
      unread: true,
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      id: 2,
      title: 'Monsoon Demand Spike',
      desc: 'Afternoon rain probability 70%. High demand projected for Hot Tea & Filter Coffee (+18%).',
      time: '35 min ago',
      unread: true,
      icon: Sparkles,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 3,
      title: 'Lunch Prep Target Met',
      desc: '94% of recommended lunch batches completed on schedule.',
      time: '1 hour ago',
      unread: false,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Greeting / Location */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-800">
                {getGreeting()}, <span className="text-indigo-600">Restaurant Manager</span>
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Core Live
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate()}
              </span>
              <span className="hidden md:flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Active Shift: Lunch Service
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Branch Selector, Global Refresh, Notifications, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Branch Selector */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 text-xs font-medium text-slate-700 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-indigo-600" />
              <span className="max-w-[150px] truncate">{selectedBranch}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showBranchMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Kitchen Branch
                </div>
                {[
                  'Indiranagar Flagship Kitchen',
                  'Koramangala Central Hub',
                  'Whitefield Tech Express',
                ].map(branch => (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      selectedBranch === branch ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{branch}</span>
                    {selectedBranch === branch && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Refresh Button */}
          {onGlobalRefresh && (
            <button
              type="button"
              onClick={onGlobalRefresh}
              disabled={isRefreshing}
              title="Recalculate AI demand and inventory sync"
              className={`p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all ${
                isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              aria-label="View Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Live Operational Alerts
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    2 Unread
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.map(n => {
                    const IconComp = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 ${
                          n.unread ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 h-fit ${n.color}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-semibold text-slate-900 truncate">
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <span className="text-[11px] font-medium text-slate-500">
                    Auto-synchronized with kitchen POS & cold storage sensors
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={userDisplayName}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  {userInitials}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                  {user?.email || 'Live Staff'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{userDisplayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Authenticated User'}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Live Cloud Staff
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setShowProfile(false)}
                    className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Kitchen Settings
                  </Link>
                  <Link
                    to="/reports"
                    onClick={() => setShowProfile(false)}
                    className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Audit & Reports
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
