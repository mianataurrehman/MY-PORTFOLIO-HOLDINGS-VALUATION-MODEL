import React from 'react';
import { StockHolding } from '../types/stock';
import { X, TrendingUp, TrendingDown, Layers, DollarSign, BarChart2, Plus } from 'lucide-react';

interface StockDetailsModalProps {
  holding: StockHolding | null;
  onClose: () => void;
  onBuyMore: (symbol: string) => void;
  onSellShares: (symbol: string, qty: number) => void;
  onLiquidateAll: (symbol: string) => void;
}

export const StockDetailsModal: React.FC<StockDetailsModalProps> = ({
  holding,
  onClose,
  onBuyMore,
  onSellShares,
  onLiquidateAll,
}) => {
  if (!holding) return null;

  const isPlPositive = holding.pl >= 0;
  const isChangePositive = holding.change >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 font-mono">
      <div className="bg-[#18191d] border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#1e2025] px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#221f15] text-[#d4af37] border border-[#725e21]">
              {holding.mkt}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-100">{holding.symbol}</h3>
                <span className="text-xs text-neutral-400 font-sans">{holding.sector}</span>
              </div>
              <p className="text-xs text-neutral-400">Position Details & Technical Snapshot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#121316] p-3 rounded-lg border border-neutral-800">
              <div className="text-neutral-400 text-[11px]">Current Market Price</div>
              <div className="text-lg font-bold text-neutral-100 mt-1">{holding.currentPrice.toFixed(2)} PKR</div>
              <div className={`text-[11px] font-medium mt-0.5 ${isChangePositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isChangePositive ? `+${holding.change.toFixed(2)} (+${holding.changePercent.toFixed(2)}%)` : `${holding.change.toFixed(2)} (${holding.changePercent.toFixed(2)}%)`}
              </div>
            </div>

            <div className="bg-[#121316] p-3 rounded-lg border border-neutral-800">
              <div className="text-neutral-400 text-[11px]">Unrealized Gain / Loss</div>
              <div className={`text-lg font-bold mt-1 ${isPlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPlPositive ? `+${holding.pl.toFixed(2)}` : holding.pl.toFixed(2)} PKR
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Weight: <strong className="text-neutral-200">{holding.weight.toFixed(2)}%</strong> of portfolio
              </div>
            </div>
          </div>

          {/* Holding Breakdown Table */}
          <div className="bg-[#121316] rounded-lg border border-neutral-800 p-3 space-y-2">
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Shares Owned:</span>
              <span className="text-neutral-200 font-bold">{holding.qty} shares ({holding.lots} lots)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Average Purchase Price:</span>
              <span className="text-neutral-200 font-semibold">{holding.avgPrice.toFixed(2)} PKR</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Total Capital Invested:</span>
              <span className="text-neutral-200 font-semibold">{holding.investment.toLocaleString('en-US', { minimumFractionDigits: 2 })} PKR</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Current Market Valuation:</span>
              <span className="text-neutral-100 font-bold">{holding.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} PKR</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-400">Today's Range (Low - High):</span>
              <span className="text-neutral-300">{holding.low.toFixed(2)} — {holding.high.toFixed(2)} PKR</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-400">Session Trading Volume:</span>
              <span className="text-neutral-300 font-semibold">{holding.volume}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onClose();
                onBuyMore(holding.symbol);
              }}
              className="flex-1 py-2 rounded-lg bg-[#0b3c22] hover:bg-[#0f4f2e] text-[#48bb78] border border-[#1c643b] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buy More</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onSellShares(holding.symbol, Math.max(1, Math.floor(holding.qty / 2)));
              }}
              className="flex-1 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Sell Partial</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onLiquidateAll(holding.symbol);
              }}
              className="flex-1 py-2 rounded-lg bg-[#3c1418] hover:bg-[#521b21] text-[#f56565] border border-[#78242a] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Liquidate All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
