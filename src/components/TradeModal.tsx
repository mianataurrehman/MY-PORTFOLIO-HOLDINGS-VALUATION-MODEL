import React, { useState, useEffect } from 'react';
import { StockHolding, WatchlistItem, TradeType } from '../types/stock';
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TradeType;
  initialSymbol?: string;
  initialQuantity?: number;
  isSellAll?: boolean;
  holdings: StockHolding[];
  watchlist: WatchlistItem[];
  cashBalance: number;
  onExecuteTrade: (trade: {
    symbol: string;
    type: TradeType;
    qty: number;
    lots: number;
    price: number;
    grossAmount: number;
    commission: number;
    netCashFlow: number;
    realizedPl?: number;
    notes?: string;
    sector?: string;
  }) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  initialType = 'BUY',
  initialSymbol = '',
  initialQuantity,
  isSellAll = false,
  holdings,
  watchlist,
  cashBalance,
  onExecuteTrade,
}) => {
  const [type, setType] = useState<TradeType>(initialType);
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [qty, setQty] = useState<number>(10);
  const [lots, setLots] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Match existing holding or watchlist item
  const existingHolding = holdings.find((h) => h.symbol.toUpperCase() === symbol.trim().toUpperCase());
  const existingWatchlist = watchlist.find((w) => w.symbol.toUpperCase() === symbol.trim().toUpperCase());

  // Initialize or reset when modal opens or initialSymbol changes
  useEffect(() => {
    if (isOpen) {
      const targetSym = initialSymbol || (holdings[0]?.symbol ?? 'FFC');
      setSymbol(targetSym);
      setType(initialType);
      setError(null);

      const targetHolding = holdings.find((h) => h.symbol.toUpperCase() === targetSym.toUpperCase());
      const targetWatch = watchlist.find((w) => w.symbol.toUpperCase() === targetSym.toUpperCase());

      const refPrice = targetHolding?.currentPrice ?? targetWatch?.currentPrice ?? 100;
      setPrice(refPrice);

      if (initialType === 'SELL' && targetHolding) {
        if (isSellAll) {
          setQty(targetHolding.qty);
          setLots(targetHolding.lots);
        } else if (initialQuantity) {
          setQty(initialQuantity);
          setLots(Math.max(1, Math.floor(initialQuantity / 10)));
        } else {
          setQty(Math.min(10, targetHolding.qty));
          setLots(1);
        }
      } else {
        setQty(initialQuantity || 10);
        setLots(1);
      }
    }
  }, [isOpen, initialType, initialSymbol, isSellAll, initialQuantity]);

  if (!isOpen) return null;

  // Real-time calculation
  const grossValue = qty * price;
  const commissionRate = 0.0015; // 0.15% standard broker commission
  const commission = Math.round(grossValue * commissionRate * 100) / 100;
  const netCashFlow = type === 'BUY' ? -(grossValue + commission) : grossValue - commission;

  // Realized P/L calculation for SELL orders
  let estimatedRealizedPl: number | undefined = undefined;
  if (type === 'SELL' && existingHolding) {
    const costBasis = existingHolding.avgPrice * qty;
    estimatedRealizedPl = (price - existingHolding.avgPrice) * qty - commission;
  }

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    setError(null);
    const h = holdings.find((x) => x.symbol.toUpperCase() === newSymbol.toUpperCase());
    const w = watchlist.find((x) => x.symbol.toUpperCase() === newSymbol.toUpperCase());
    if (h) {
      setPrice(h.currentPrice);
      if (type === 'SELL') {
        setQty(Math.min(10, h.qty));
      }
    } else if (w) {
      setPrice(w.currentPrice);
    }
  };

  const handleSetMaxShares = () => {
    if (existingHolding) {
      setQty(existingHolding.qty);
      setLots(existingHolding.lots);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) {
      setError('Please select or enter a valid stock symbol.');
      return;
    }

    if (qty <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    if (price <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    if (type === 'BUY') {
      const requiredCash = grossValue + commission;
      if (requiredCash > cashBalance) {
        setError(
          `Insufficient cash! Order requires ${requiredCash.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} PKR, but your available balance is ${cashBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} PKR.`
        );
        return;
      }
    }

    if (type === 'SELL') {
      if (!existingHolding) {
        setError(`You do not own any shares of ${cleanSymbol} to sell.`);
        return;
      }
      if (qty > existingHolding.qty) {
        setError(
          `Cannot sell ${qty} shares. You currently own only ${existingHolding.qty} shares of ${cleanSymbol}.`
        );
        return;
      }
    }

    // Determine sector
    const sector =
      existingHolding?.sector ||
      existingWatchlist?.sector ||
      'EQUITY TRADING';

    onExecuteTrade({
      symbol: cleanSymbol,
      type,
      qty,
      lots: Math.max(1, lots),
      price,
      grossAmount: grossValue,
      commission,
      netCashFlow,
      realizedPl: estimatedRealizedPl,
      notes: notes.trim() || undefined,
      sector,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#18191d] border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#1e2025] px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                type === 'BUY'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {type === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100">
                {type === 'BUY' ? 'Execute Buy Order' : isSellAll ? 'Liquidate Entire Position' : 'Execute Sell Order'}
              </h3>
              <p className="text-xs text-neutral-400">Instant trade execution with automatic ledger updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Action Selector: BUY vs SELL */}
          <div className="grid grid-cols-2 gap-2 bg-[#121316] p-1 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                type === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>BUY (Accumulate)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                type === 'SELL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>SELL (Exit / Book P/L)</span>
            </button>
          </div>

          {/* Symbol Select / Input */}
          <div>
            <label className="block text-neutral-400 font-medium mb-1.5">Stock Symbol</label>
            <div className="flex gap-2">
              <select
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                className="flex-1 bg-[#121316] border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono font-semibold focus:outline-none focus:border-emerald-500"
              >
                <optgroup label="Your Current Holdings">
                  {holdings.map((h) => (
                    <option key={h.id} value={h.symbol}>
                      {h.symbol} — {h.sector} (Own: {h.qty} shs @ {h.currentPrice.toFixed(2)})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Watchlist Candidates">
                  {watchlist.map((w) => (
                    <option key={w.id} value={w.symbol}>
                      {w.symbol} — {w.companyName} (Price: {w.currentPrice.toFixed(2)})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            {existingHolding && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-400">
                <span>
                  Holding: <strong className="text-neutral-200">{existingHolding.qty} shares</strong> ({existingHolding.lots} lots)
                </span>
                <span>
                  Avg Cost: <strong className="text-neutral-200">{existingHolding.avgPrice.toFixed(2)}</strong> PKR
                </span>
                {type === 'SELL' && (
                  <button
                    type="button"
                    onClick={handleSetMaxShares}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    Select All ({existingHolding.qty})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Grid: Qty, Lots, Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Shares (Qty)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={qty}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setQty(val);
                  setLots(Math.max(1, Math.round(val / 10)));
                }}
                className="w-full bg-[#121316] border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">Lots</label>
              <input
                type="number"
                min="1"
                step="1"
                value={lots}
                onChange={(e) => setLots(parseInt(e.target.value) || 1)}
                className="w-full bg-[#121316] border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">Price (PKR)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121316] border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Trade Financial Summary Card */}
          <div className="bg-[#121316] p-3.5 rounded-lg border border-neutral-800 space-y-2 font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>Gross Trade Value:</span>
              <span className="text-neutral-100 font-semibold">
                {grossValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR
              </span>
            </div>

            <div className="flex justify-between text-neutral-400">
              <span>Brokerage Commission (0.15%):</span>
              <span className="text-neutral-300">
                {commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold">
              <span className={type === 'BUY' ? 'text-amber-400' : 'text-emerald-400'}>
                {type === 'BUY' ? 'Net Cash Required (Debit):' : 'Net Cash Proceeds (Credit):'}
              </span>
              <span className="text-sm text-neutral-100">
                {Math.abs(netCashFlow).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR
              </span>
            </div>

            {/* Estimated Realized P/L preview for SELL */}
            {type === 'SELL' && estimatedRealizedPl !== undefined && (
              <div className="pt-2 border-t border-dashed border-neutral-800 flex justify-between font-bold">
                <span className="text-neutral-400">Estimated Realized P/L:</span>
                <span className={estimatedRealizedPl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {estimatedRealizedPl >= 0 ? `+${estimatedRealizedPl.toFixed(2)}` : estimatedRealizedPl.toFixed(2)} PKR
                </span>
              </div>
            )}
          </div>

          {/* Cash Balance Indicator */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>
              Available Cash: <strong className="text-emerald-400">{cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} PKR</strong>
            </span>
            {type === 'BUY' && (
              <span>
                Remaining After Buy:{' '}
                <strong className={cashBalance - (grossValue + commission) < 0 ? 'text-rose-400' : 'text-neutral-200'}>
                  {(cashBalance - (grossValue + commission)).toLocaleString('en-US', { minimumFractionDigits: 2 })} PKR
                </strong>
              </span>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-neutral-400 font-medium mb-1">Execution / Strategy Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Target hit, Quarterly earnings dip buy, Technical breakout"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#121316] border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-1.5 shadow-md ${
                type === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{type === 'BUY' ? 'Confirm & Buy Shares' : 'Confirm & Sell Shares'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
