import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  change,
  trend = 'neutral',
  trendLabel,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBgColor = 'bg-indigo-50',
  badge,
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${iconBgColor} ${iconColor} ring-1 ring-black/5`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {badge}
          </span>
        )}
      </div>

      {(change || trendLabel) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            {trend === 'up' && (
              <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {change}
              </span>
            )}
            {trend === 'down' && (
              <span className="inline-flex items-center text-rose-600 font-semibold gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                {change}
              </span>
            )}
            {trend === 'neutral' && (
              <span className="inline-flex items-center text-slate-500 font-medium gap-0.5">
                <Minus className="w-3.5 h-3.5" />
                {change || 'Stable'}
              </span>
            )}
            {trendLabel && <span className="text-slate-500 font-normal">{trendLabel}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
