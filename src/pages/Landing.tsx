import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  ChefHat,
  Boxes,
  Trash2,
  ShieldCheck,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Store,
  Layers,
  Clock,
  CloudSun,
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'Precision Demand Forecasting',
      desc: 'Predict daily, weekly, and meal-period order volume with 94%+ accuracy using historical patterns, weekend multipliers, and local weather telemetry.',
    },
    {
      icon: ChefHat,
      title: 'Smart Kitchen Prep Planning',
      desc: 'Translate predicted orders into exact batch quantities for Morning, Lunch, Evening, and Dinner shifts with configurable safety buffers.',
    },
    {
      icon: Boxes,
      title: 'Automated Inventory & POs',
      desc: 'Convert dish demand into raw ingredient needs (kg, L, units). Automatically generate purchase orders when stock levels hit critical thresholds.',
    },
    {
      icon: Trash2,
      title: 'AI Food Waste Prevention',
      desc: 'Identify high-spoilage dishes before shifts begin. Track historical waste by root cause and recover up to 28% in lost food costs.',
    },
    {
      icon: CloudSun,
      title: 'Weather & Event Intelligence',
      desc: 'Automatically adjust menu forecasts for rain, heatwaves, cricket matches, and local festival crowds.',
    },
    {
      icon: Clock,
      title: 'Real-Time Order Tracking',
      desc: 'Monitor live order velocity against predictions throughout service hours with dynamic variance detection.',
    },
  ];

  const metrics = [
    { label: 'Forecast Accuracy', val: '94.2%', sub: 'Across high-volume items' },
    { label: 'Food Waste Reduction', val: '28.4%', sub: 'Within 60 days of rollout' },
    { label: 'Stockout Incidents', val: '-85%', sub: 'Critical ingredients saved' },
    { label: 'Kitchen Prep Time Saved', val: '1.5 hrs/day', sub: 'Automated batch sizing' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Resto<span className="text-indigo-400">AI</span>
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SaaS Enterprise
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <span>Sign In / Enter Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Commercial Restaurant Intelligence & Supply Chain OS
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Powered Restaurant Demand Forecasting
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Eliminate costly overproduction and stockouts. Predict customer traffic, calculate exact
            ingredient quantities, and streamline kitchen prep with intelligent operational models.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-102"
            >
              <span>Launch Live System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Explore Forecasting Engine</span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero setup required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Realistic Indian Menu & INR (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>13 Functional Modules</span>
            </div>
          </div>
        </div>

        {/* Highlight Numbers */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto w-full relative z-10">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-xs text-center"
            >
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{m.val}</p>
              <p className="text-xs font-semibold text-indigo-300 mt-1">{m.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Enterprise Features Built for High-Volume Kitchens
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Engineered for biryani joints, multi-cuisine diners, cloud kitchens, and restaurant chains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const IconComp = f.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/80 py-6 px-4 text-center text-xs text-slate-500">
        <p>RestoAI Platform — Indian Restaurant SaaS Operating System & AI Forecast Studio</p>
      </footer>
    </div>
  );
};
