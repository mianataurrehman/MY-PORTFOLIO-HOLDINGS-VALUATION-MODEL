import React, { useState } from 'react';
import { StockHolding } from '../types/stock';
import { Plus, X, Search, ArrowUpDown, TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface HoldingsTableProps {
  holdings: StockHolding[];
  onBuyClick: (symbol: string) => void;
  onSellAllClick: (symbol: string) => void;
  onSellPartialClick: (symbol: string, qty: number) => void;
  onInspectStock: (holding: StockHolding) => void;
}

type SortField = 'symbol' | 'sector' | 'qty' | 'avgPrice' | 'investment' | 'currentPrice' | 'currentValue' | 'change' | 'changePercent' | 'pl' | 'weight';

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  onBuyClick,
  onSellAllClick,
  onSellPartialClick,
  onInspectStock,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('investment');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for financial metrics
    }
  };

  const filteredHoldings = holdings.filter(
    (h) =>
      h.symbol.toLowerCase().includes(search.toLowerCase()) ||
      h.sector.toLowerCase().includes(search.toLowerCase())
  );

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortAsc
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return (
    <div className="bg-[#18191d] border border-neutral-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
      {/* Title Bar - Exactly matching screenshot style */}
      <div className="px-4 py-3 bg-[#18191d] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base select-none">📋</span>
          <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-neutral-200 uppercase font-mono">
            MY PORTFOLIO — HOLDINGS
          </h2>
          <span className="text-[11px] text-neutral-400 font-mono">({holdings.length} Positions)</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search symbol or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121316] border border-neutral-800 rounded px-2.5 py-1 pl-8 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono w-44 sm:w-56"
            />
          </div>

          <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
            Scroll horizontally for full details
          </span>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-mono">
          <thead>
            <tr className="bg-[#151619] text-neutral-400 text-[11px] font-semibold border-b border-neutral-800 select-none">
              <th className="py-2.5 px-3 uppercase tracking-wider text-center">MKT</th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-3 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>SYMBOL</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sector')}
                className="py-2.5 px-3 uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>SECTOR</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort('qty')}
                className="py-2.5 px-3 uppercase tracking-wider text-right cursor-pointer hover:text-white"
              >
                QTY
              </th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">LOTS</th>
              <th
                onClick={() => handleSort('avgPrice')}
                className="py-2.5 px-3 uppercase tracking-wider text-right cursor-pointer hover:text-white"
              >
                AVG PRICE
              </th>
              <th
                onClick={() => handleSort('investment')}
                className="py-2.5 px-3 uppercase tracking-wider text-right cursor-pointer hover:text-white"
              >
                INVESTMENT
              </th>
              <th
                onClick={() => handleSort('currentPrice')}
                className="py-2.5 px-3 uppercase tracking-wider text-right cursor-pointer hover:text-white"
              >
                CURRENT PRICE
              </th>
              <th
                onClick={() => handleSort('currentValue')}
                className="py-2.5 px-3 uppercase tracking-wider text-right cursor-pointer hover:text-white"
              >
                CURRENT VALUE
              </th>
              <th
                onClick={() => handleSort('change')}
                className="py-2.5 px-3 uppercase tracking-wider text-right cursor-pointer hover:text-white"
              >
                CHANGE
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-3 uppercase tracking-wider text-right cursor-pointer hover:text-white"
              >
                % CHANGE
              </th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-center">TRADE</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">VOLUME</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">LOW</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">AVERAGE</th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-right">HIGH</th>
              <th
                onClick={() => handleSort('pl')}
                className="py-2.5 px-3 uppercase tracking-wider text-right cursor-pointer hover:text-white"
              >
                P/L
              </th>
              <th
                onClick={() => handleSort('weight')}
                className="py-2.5 px-3 uppercase tracking-wider text-right cursor-pointer hover:text-white"
              >
                WEIGHT
              </th>
              <th className="py-2.5 px-3 uppercase tracking-wider text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80 bg-[#16171b]">
            {sortedHoldings.length === 0 ? (
              <tr>
                <td colSpan={19} className="py-8 text-center text-neutral-400">
                  No stock holdings found matching your filter.
                </td>
              </tr>
            ) : (
              sortedHoldings.map((h) => {
                const isPlPositive = h.pl >= 0;
                const isChangePositive = h.change >= 0;

                return (
                  <tr
                    key={h.id}
                    className={`hover:bg-[#1f2127] transition-colors duration-150 ${
                      h.priceFlash === 'up' ? 'flash-up' : h.priceFlash === 'down' ? 'flash-down' : ''
                    }`}
                  >
                    {/* MKT badge */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#221f15] text-[#d4af37] border border-[#725e21]">
                        {h.mkt}
                      </span>
                    </td>

                    {/* SYMBOL */}
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onInspectStock(h)}
                        className="font-bold text-neutral-100 hover:text-emerald-400 transition-colors cursor-pointer text-left"
                        title="Click to view details and technical chart"
                      >
                        {h.symbol}
                      </button>
                    </td>

                    {/* SECTOR */}
                    <td className="py-2.5 px-3 text-neutral-400 text-[11px] truncate max-w-[200px]" title={h.sector}>
                      {h.sector}
                    </td>

                    {/* QTY */}
                    <td className="py-2.5 px-3 text-right text-neutral-200 font-medium">
                      {h.qty.toLocaleString()}
                    </td>

                    {/* LOTS */}
                    <td className="py-2.5 px-3 text-right text-neutral-300 font-medium">
                      {h.lots}
                    </td>

                    {/* AVG PRICE */}
                    <td className="py-2.5 px-3 text-right text-neutral-300">
                      {h.avgPrice.toFixed(2)}
                    </td>

                    {/* INVESTMENT */}
                    <td className="py-2.5 px-3 text-right text-neutral-200 font-medium">
                      {h.investment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* CURRENT PRICE */}
                    <td className="py-2.5 px-3 text-right text-neutral-100 font-semibold">
                      {h.currentPrice.toFixed(2)}
                    </td>

                    {/* CURRENT VALUE */}
                    <td className="py-2.5 px-3 text-right text-neutral-100 font-semibold">
                      {h.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* CHANGE */}
                    <td
                      className={`py-2.5 px-3 text-right font-medium ${
                        isChangePositive ? 'text-[#38c172]' : 'text-[#e3342f]'
                      }`}
                    >
                      {isChangePositive ? `+${h.change.toFixed(2)}` : h.change.toFixed(2)}
                    </td>

                    {/* % CHANGE */}
                    <td
                      className={`py-2.5 px-3 text-right font-medium ${
                        isChangePositive ? 'text-[#38c172]' : 'text-[#e3342f]'
                      }`}
                    >
                      {isChangePositive ? `+${h.changePercent.toFixed(2)}%` : `${h.changePercent.toFixed(2)}%`}
                    </td>

                    {/* TRADE (WATCH / HOLD badge) */}
                    <td className="py-2.5 px-3 text-center">
                      {h.tradeSignal === 'HOLD' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-[#38c172] border border-[#217646] bg-[#0c2e1a]">
                          HOLD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-[#e3342f] border border-[#772121] bg-[#2a1114]">
                          WATCH
                        </span>
                      )}
                    </td>

                    {/* VOLUME */}
                    <td className="py-2.5 px-3 text-right text-neutral-400">
                      {h.volume}
                    </td>

                    {/* LOW */}
                    <td className="py-2.5 px-3 text-right text-neutral-400">
                      {h.low.toFixed(2)}
                    </td>

                    {/* AVERAGE */}
                    <td className="py-2.5 px-3 text-right text-neutral-400">
                      {h.average.toFixed(2)}
                    </td>

                    {/* HIGH */}
                    <td className="py-2.5 px-3 text-right text-neutral-400">
                      {h.high.toFixed(2)}
                    </td>

                    {/* P/L */}
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        isPlPositive ? 'text-[#38c172]' : 'text-[#e3342f]'
                      }`}
                    >
                      {isPlPositive ? `+${h.pl.toFixed(2)}` : h.pl.toFixed(2)}
                    </td>

                    {/* WEIGHT */}
                    <td className="py-2.5 px-3 text-right text-neutral-300">
                      {h.weight.toFixed(2)}%
                    </td>

                    {/* ACTIONS */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* + Buy button matching screenshot */}
                        <button
                          onClick={() => onBuyClick(h.symbol)}
                          className="px-2.5 py-1 rounded bg-[#0b3c22] hover:bg-[#0f4f2e] text-[#48bb78] border border-[#1c643b] text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                          title={`Buy more shares of ${h.symbol}`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Buy</span>
                        </button>

                        {/* Partial Sell */}
                        <button
                          onClick={() => onSellPartialClick(h.symbol, Math.max(1, Math.floor(h.qty / 2)))}
                          className="px-2 py-1 rounded bg-[#272930] hover:bg-[#343740] text-neutral-300 border border-neutral-700 text-xs font-semibold transition-all shadow-sm active:scale-95"
                          title={`Sell partial shares of ${h.symbol}`}
                        >
                          Sell
                        </button>

                        {/* ✕ All button matching screenshot */}
                        <button
                          onClick={() => onSellAllClick(h.symbol)}
                          className="px-2.5 py-1 rounded bg-[#3c1418] hover:bg-[#521b21] text-[#f56565] border border-[#78242a] text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                          title={`Liquidate all ${h.qty} shares of ${h.symbol}`}
                        >
                          <X className="w-3 h-3" />
                          <span>All</span>
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
