import React, { useState } from 'react';
import { TradeRecord } from '../types/stock';
import { History, Search, Download, TrendingUp, TrendingDown } from 'lucide-react';

interface TradeLogViewProps {
  trades: TradeRecord[];
  onOpenTradeModal: () => void;
}

export const TradeLogView: React.FC<TradeLogViewProps> = ({ trades, onOpenTradeModal }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredTrades = trades.filter((t) => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesSearch =
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const totalBuyVolume = trades.filter((t) => t.type === 'BUY').reduce((acc, t) => acc + t.grossAmount, 0);
  const totalSellVolume = trades.filter((t) => t.type === 'SELL').reduce((acc, t) => acc + t.grossAmount, 0);
  const totalRealizedFromSells = trades.reduce((acc, t) => acc + (t.realizedPl || 0), 0);

  return (
    <div className="bg-[#18191d] border border-neutral-800 rounded-lg shadow-xl overflow-hidden flex flex-col font-mono">
      {/* Title Bar */}
      <div className="px-4 py-3 bg-[#18191d] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-neutral-200 uppercase">
            TRADE LOG & ORDER EXECUTION LEDGER
          </h2>
          <span className="text-[11px] text-neutral-400">({trades.length} Executed)</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search trade ID or symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121316] border border-neutral-800 rounded px-2.5 py-1 pl-8 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={onOpenTradeModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
          >
            <span>+ New Order</span>
          </button>
        </div>
      </div>

      {/* Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800 bg-[#141518] border-b border-neutral-800 text-xs">
        <div className="p-3 flex items-center justify-between">
          <span className="text-neutral-400">Total Purchases (Gross):</span>
          <span className="font-bold text-neutral-100">{totalBuyVolume.toLocaleString()} PKR</span>
        </div>
        <div className="p-3 flex items-center justify-between">
          <span className="text-neutral-400">Total Sales (Gross):</span>
          <span className="font-bold text-neutral-100">{totalSellVolume.toLocaleString()} PKR</span>
        </div>
        <div className="p-3 flex items-center justify-between">
          <span className="text-neutral-400">Net Realized P/L:</span>
          <span className={`font-bold ${totalRealizedFromSells >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRealizedFromSells >= 0 ? `+${totalRealizedFromSells.toFixed(2)}` : totalRealizedFromSells.toFixed(2)} PKR
          </span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-4 py-2 bg-[#121316] border-b border-neutral-800 flex items-center gap-2">
        {['ALL', 'BUY', 'SELL'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filterType === t
                ? 'bg-neutral-700 text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t === 'ALL' ? 'All Orders' : `${t} Orders Only`}
          </button>
        ))}
      </div>

      {/* Trades Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[#151619] text-neutral-400 text-[11px] font-semibold border-b border-neutral-800 select-none">
              <th className="py-2.5 px-3 uppercase tracking-wider">TRADE ID</th>
              <th className="py-2.5 px-3 uppercase tracking-wider">DATE & TIME</th>
              <th className="py-2.5 px-3 uppercase tracking-wider">SYMBOL</th>
              <th className="py-2.5 px-3 uppercase tracking-wider">ACTION</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">LOTS</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">SHARES</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">EXEC PRICE</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">GROSS VALUE</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">COMMISSION</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">NET CASH FLOW</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">REALIZED P/L</th>
              <th className="py-2.5 px-3 uppercase tracking-wider">NOTES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80 bg-[#16171b]">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-neutral-400">
                  No trades found matching criteria.
                </td>
              </tr>
            ) : (
              filteredTrades.map((t) => (
                <tr key={t.id} className="hover:bg-[#1f2127] transition-colors">
                  <td className="py-2.5 px-3 text-neutral-400 font-semibold">{t.id}</td>
                  <td className="py-2.5 px-3 text-neutral-300">
                    <span>{t.date}</span> <span className="text-neutral-500 text-[10px]">{t.time}</span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-neutral-100">{t.symbol}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        t.type === 'BUY'
                          ? 'bg-[#0b3c22] text-[#48bb78] border border-[#1c643b]'
                          : 'bg-[#3c1418] text-[#f56565] border border-[#78242a]'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-300">{t.lots}</td>
                  <td className="py-2.5 px-3 text-right text-neutral-200 font-medium">{t.qty}</td>
                  <td className="py-2.5 px-3 text-right text-neutral-200">{t.price.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right text-neutral-100 font-semibold">
                    {t.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-400">{t.commission.toFixed(2)}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-medium ${
                      t.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.netCashFlow >= 0 ? `+${t.netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : t.netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    {t.type === 'SELL' && t.realizedPl !== undefined ? (
                      <span className={t.realizedPl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {t.realizedPl >= 0 ? `+${t.realizedPl.toFixed(2)}` : t.realizedPl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400 truncate max-w-[200px]" title={t.notes}>
                    {t.notes || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
