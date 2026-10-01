import React, { useState } from 'react';
import { WatchlistItem } from '../types/stock';
import { Plus, Search, Trash2, ArrowUpRight, TrendingUp, TrendingDown, Target, Bell } from 'lucide-react';

interface WatchlistSectionProps {
  watchlist: WatchlistItem[];
  onQuickBuy: (symbol: string) => void;
  onAddToWatchlist: (item: Omit<WatchlistItem, 'id'>) => void;
  onRemoveFromWatchlist: (id: string) => void;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  watchlist,
  onQuickBuy,
  onAddToWatchlist,
  onRemoveFromWatchlist,
}) => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newPrice, setNewPrice] = useState<number>(100);
  const [newTarget, setNewTarget] = useState<number>(90);
  const [newNotes, setNewNotes] = useState('');

  const filteredWatchlist = watchlist.filter(
    (w) =>
      w.symbol.toLowerCase().includes(search.toLowerCase()) ||
      w.companyName.toLowerCase().includes(search.toLowerCase()) ||
      w.sector.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    onAddToWatchlist({
      symbol: newSymbol.trim().toUpperCase(),
      companyName: newCompany.trim() || `${newSymbol.trim().toUpperCase()} Corp`,
      sector: newSector.trim().toUpperCase() || 'EQUITY',
      currentPrice: newPrice,
      prevClose: newPrice,
      change: 0,
      changePercent: 0,
      dayLow: newPrice * 0.98,
      dayHigh: newPrice * 1.02,
      volume: '500K',
      targetBuyPrice: newTarget,
      status: newPrice <= newTarget ? 'STRONG BUY' : 'WATCH',
      notes: newNotes.trim() || undefined,
    });

    setIsAdding(false);
    setNewSymbol('');
    setNewCompany('');
    setNewSector('');
    setNewPrice(100);
    setNewTarget(90);
    setNewNotes('');
  };

  return (
    <div className="bg-[#18191d] border border-neutral-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="px-4 py-3 bg-[#18191d] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-neutral-200 uppercase font-mono">
            WATCHLIST & TARGET PRICE TRIGGERS
          </h2>
          <span className="text-[11px] text-neutral-400 font-mono">({watchlist.length} Tracked)</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search watchlist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121316] border border-neutral-800 rounded px-2.5 py-1 pl-8 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono w-40 sm:w-52"
            />
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Add New Watchlist Item Drawer */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-[#141518] p-4 border-b border-neutral-800 text-xs font-mono space-y-3">
          <div className="text-neutral-300 font-bold flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Add New Stock to Live Watchlist</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Symbol (e.g. PSO)</label>
              <input
                type="text"
                required
                placeholder="PSO"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="w-full bg-[#1b1c20] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100 uppercase"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Pakistan State Oil"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full bg-[#1b1c20] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Sector</label>
              <input
                type="text"
                placeholder="OIL & GAS MARKETING"
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                className="w-full bg-[#1b1c20] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100 uppercase"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Current Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#1b1c20] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Target Buy Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={newTarget}
                onChange={(e) => setNewTarget(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#1b1c20] border border-neutral-700 rounded px-2.5 py-1.5 text-amber-300 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <input
              type="text"
              placeholder="Investment thesis or technical alert notes..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="flex-1 bg-[#1b1c20] border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200 text-xs"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
              >
                Save Stock
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Watchlist Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-mono">
          <thead>
            <tr className="bg-[#151619] text-neutral-400 text-[11px] font-semibold border-b border-neutral-800 select-none">
              <th className="py-2.5 px-3 uppercase tracking-wider">SYMBOL</th>
              <th className="py-2.5 px-3 uppercase tracking-wider">COMPANY & SECTOR</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">TARGET BUY</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">CURRENT PRICE</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">DAY CHANGE</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">% CHANGE</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-center">DAY RANGE (LOW / HIGH)</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-center">TRIGGER STATUS</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80 bg-[#16171b]">
            {filteredWatchlist.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-neutral-400">
                  No stocks found in watchlist. Click "+ Add Stock" to track one.
                </td>
              </tr>
            ) : (
              filteredWatchlist.map((item) => {
                const isPriceInBuyZone = item.currentPrice <= item.targetBuyPrice;
                const isNearZone = !isPriceInBuyZone && item.currentPrice <= item.targetBuyPrice * 1.03;
                const spreadPercent = ((item.currentPrice - item.targetBuyPrice) / item.targetBuyPrice) * 100;
                const daySpan = Math.max(0.01, item.dayHigh - item.dayLow);
                const currentProgress = Math.min(100, Math.max(0, ((item.currentPrice - item.dayLow) / daySpan) * 100));

                return (
                  <tr key={item.id} className="hover:bg-[#1f2127] transition-colors">
                    {/* Symbol */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-100 flex items-center gap-1.5">
                        <span>{item.symbol}</span>
                        {isPriceInBuyZone && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                    </td>

                    {/* Company & Sector */}
                    <td className="py-3 px-3">
                      <div className="text-neutral-200 font-medium">{item.companyName}</div>
                      <div className="text-[10px] text-neutral-400">{item.sector}</div>
                    </td>

                    {/* Target Buy Price */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-amber-400">
                        {item.targetBuyPrice.toFixed(2)} PKR
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Spread: {spreadPercent > 0 ? `+${spreadPercent.toFixed(1)}%` : `${spreadPercent.toFixed(1)}%`}
                      </div>
                    </td>

                    {/* Current Price */}
                    <td className="py-3 px-3 text-right font-bold text-neutral-100">
                      {item.currentPrice.toFixed(2)} PKR
                    </td>

                    {/* Day Change */}
                    <td
                      className={`py-3 px-3 text-right font-medium ${
                        item.change >= 0 ? 'text-[#38c172]' : 'text-[#e3342f]'
                      }`}
                    >
                      {item.change > 0 ? `+${item.change.toFixed(2)}` : item.change.toFixed(2)}
                    </td>

                    {/* % Change */}
                    <td
                      className={`py-3 px-3 text-right font-medium ${
                        item.changePercent >= 0 ? 'text-[#38c172]' : 'text-[#e3342f]'
                      }`}
                    >
                      {item.changePercent > 0 ? `+${item.changePercent.toFixed(2)}%` : `${item.changePercent.toFixed(2)}%`}
                    </td>

                    {/* Day Range Low - High Bar */}
                    <td className="py-3 px-3 min-w-[150px]">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                        <span>{item.dayLow.toFixed(2)}</span>
                        <span>{item.dayHigh.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5 relative overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${currentProgress}%` }}
                        />
                      </div>
                    </td>

                    {/* Trigger Status */}
                    <td className="py-3 px-3 text-center">
                      {isPriceInBuyZone ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-emerald-300 border border-emerald-500 bg-emerald-950/80">
                          🎯 BUY TRIGGER HIT
                        </span>
                      ) : isNearZone ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-amber-300 border border-amber-600 bg-amber-950/70">
                          ⚡ NEAR BUY ZONE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wider text-neutral-400 border border-neutral-700 bg-neutral-800/80">
                          MONITORING
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onQuickBuy(item.symbol)}
                          className="px-2.5 py-1 rounded bg-[#0b3c22] hover:bg-[#0f4f2e] text-[#48bb78] border border-[#1c643b] text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                          title={`Execute Buy order for ${item.symbol}`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Buy</span>
                        </button>
                        <button
                          onClick={() => onRemoveFromWatchlist(item.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
