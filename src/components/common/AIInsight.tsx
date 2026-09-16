import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';

interface AIInsightProps {
  title?: string;
  message: string;
  type?: 'action' | 'warning' | 'info' | 'positive';
  impactBadge?: string;
  onActionClick?: () => void;
  actionLabel?: string;
  className?: string;
}

export const AIInsight: React.FC<AIInsightProps> = ({
  title = 'AI Recommendation Engine',
  message,
  type = 'action',
  impactBadge,
  onActionClick,
  actionLabel,
  className = '',
}) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          wrapper: 'bg-gradient-to-r from-amber-50 to-orange-50/50 border-amber-200/80 text-amber-950 shadow-sm',
          iconBg: 'bg-amber-500 text-white shadow-sm shadow-amber-200',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white',
          Icon: AlertTriangle,
        };
      case 'positive':
        return {
          wrapper: 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-200/80 text-emerald-950 shadow-sm',
          iconBg: 'bg-emerald-600 text-white shadow-sm shadow-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          Icon: CheckCircle,
        };
      case 'info':
        return {
          wrapper: 'bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-200/80 text-blue-950 shadow-sm',
          iconBg: 'bg-blue-600 text-white shadow-sm shadow-blue-200',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          btn: 'bg-blue-600 hover:bg-blue-700 text-white',
          Icon: Info,
        };
      case 'action':
      default:
        return {
          wrapper: 'bg-gradient-to-r from-violet-50/90 via-indigo-50/60 to-purple-50/80 border-indigo-200 text-slate-900 shadow-sm',
          iconBg: 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          Icon: Sparkles,
        };
    }
  };

  const current = getStyles();
  const IconComponent = current.Icon;

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-200 ${current.wrapper} ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`shrink-0 p-2 rounded-lg flex items-center justify-center ${current.iconBg}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-indigo-700/80">
                {title}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/80 border border-slate-200/60 text-slate-600">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                Live Model
              </span>
            </div>
            {impactBadge && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${current.badge}`}
              >
                {impactBadge}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-normal">{message}</p>

          {onActionClick && actionLabel && (
            <div className="mt-3 flex items-center">
              <button
                type="button"
                onClick={onActionClick}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-xs ${current.btn}`}
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
