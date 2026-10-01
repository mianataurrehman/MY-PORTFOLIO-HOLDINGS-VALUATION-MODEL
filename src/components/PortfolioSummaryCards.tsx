import React from 'react';
import { PortfolioTotals } from '../types/stock';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ShieldCheck, PieChart, Activity } from 'lucide-react';

interface PortfolioSummaryCardsProps {
  totals: PortfolioTotals;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onRefreshPrices: () => void;
}

export const PortfolioSummaryCards: React.FC<PortfolioSummaryCardsProps> = ({
  totals,
  isSimulating,
  onToggleSimulation,
  onRefreshPrices,
}) => {
  const isUnrealizedPositive = totals.totalUnrealizedPl >= 0;
  const isTodayPositive = totals.todayChange >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
      {/* 1. Total Current Value */}
      <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>Portfolio Value</span>
          <PieChart className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="mt-1.5 text-base sm:text-lg font-bold text-neutral-100 truncate">
          {totals.totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-neutral-400 truncate">
          Cost: {totals.totalInvestment.toLocaleString('en-US', { maximumFractionDigits: 0 })} PKR
        </div>
      </div>

      {/* 2. Today's Change */}
      <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>Day's Change</span>
          {isTodayPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          )}
        </div>
        <div
          className={`mt-1.5 text-base sm:text-lg font-bold truncate ${
            isTodayPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isTodayPositive ? `+${totals.todayChange.toFixed(2)}` : totals.todayChange.toFixed(2)}
        </div>
        <div
          className={`text-[10px] truncate ${
            isTodayPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isTodayPositive ? `+${totals.todayChangePercent.toFixed(2)}%` : `${totals.todayChangePercent.toFixed(2)}%`} Today
        </div>
      </div>

      {/* 3. Unrealized P/L */}
      <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>Unrealized P/L</span>
          <span className="text-[10px] text-neutral-400">Open</span>
        </div>
        <div
          className={`mt-1.5 text-base sm:text-lg font-bold truncate ${
            isUnrealizedPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isUnrealizedPositive ? `+${totals.totalUnrealizedPl.toFixed(2)}` : totals.totalUnrealizedPl.toFixed(2)}
        </div>
        <div
          className={`text-[10px] truncate ${
            isUnrealizedPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isUnrealizedPositive ? `+${totals.totalUnrealizedPlPercent.toFixed(2)}%` : `${totals.totalUnrealizedPlPercent.toFixed(2)}%`} ROI
        </div>
      </div>

      {/* 4. Realized P/L */}
      <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>Realized P/L</span>
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className={`mt-1.5 text-base sm:text-lg font-bold truncate ${totals.totalRealizedPl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {totals.totalRealizedPl >= 0 ? `+${totals.totalRealizedPl.toFixed(2)}` : totals.totalRealizedPl.toFixed(2)}
        </div>
        <div className="text-[10px] text-neutral-400 truncate">Booked gains from sells</div>
      </div>

      {/* 5. Available Cash */}
      <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>Available Cash</span>
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1.5 text-base sm:text-lg font-bold text-emerald-400 truncate">
          {totals.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="text-[10px] text-neutral-400 truncate">Ready purchasing power</div>
      </div>

      {/* 6. Total Equity (NAV) */}
      <div className="bg-[#18191d] border border-emerald-900/50 rounded-lg p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-neutral-300 text-[11px]">
          <span className="font-semibold text-emerald-400">Total Equity (NAV)</span>
          <button
            onClick={onToggleSimulation}
            className={`p-1 rounded transition-colors ${isSimulating ? 'text-emerald-400 bg-emerald-950 animate-pulse' : 'text-neutral-500 hover:text-neutral-300'}`}
            title={isSimulating ? 'Market simulator is running live ticks' : 'Click to enable live market price ticks'}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-1.5 text-base sm:text-lg font-bold text-neutral-100 truncate">
          {totals.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-neutral-400 truncate">
          Cash + Holdings
        </div>
      </div>
    </div>
  );
};
