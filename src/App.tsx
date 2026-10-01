import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StockHolding, TradeRecord, WatchlistItem, StatementEntry, PortfolioTotals, TradeType } from './types/stock';
import { INITIAL_HOLDINGS, INITIAL_WATCHLIST, INITIAL_TRADES, INITIAL_STATEMENTS } from './data/initialData';
import { HeaderNav, MainTab } from './components/HeaderNav';
import { PortfolioSummaryCards } from './components/PortfolioSummaryCards';
import { HoldingsTable } from './components/HoldingsTable';
import { WatchlistSection } from './components/WatchlistSection';
import { AccountStatementView } from './components/AccountStatementView';
import { TradeLogView } from './components/TradeLogView';
import { ExcelFormulaViewer } from './components/ExcelFormulaViewer';
import { TradeModal } from './components/TradeModal';
import { StockDetailsModal } from './components/StockDetailsModal';
import { PortfolioHeatmap } from './components/PortfolioHeatmap';
import { exportPortfolioToExcel } from './utils/excelGenerator';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<MainTab>('holdings');

  // Core Data States
  const [holdings, setHoldings] = useState<StockHolding[]>(() => {
    const saved = localStorage.getItem('protrade_holdings');
    return saved ? JSON.parse(saved) : INITIAL_HOLDINGS;
  });

  const [trades, setTrades] = useState<TradeRecord[]>(() => {
    const saved = localStorage.getItem('protrade_trades');
    return saved ? JSON.parse(saved) : INITIAL_TRADES;
  });

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('protrade_watchlist');
    return saved ? JSON.parse(saved) : INITIAL_WATCHLIST;
  });

  const [statements, setStatements] = useState<StatementEntry[]>(() => {
    const saved = localStorage.getItem('protrade_statements');
    return saved ? JSON.parse(saved) : INITIAL_STATEMENTS;
  });

  // Modals
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeModalType, setTradeModalType] = useState<TradeType>('BUY');
  const [tradeModalSymbol, setTradeModalSymbol] = useState<string>('');
  const [tradeModalQuantity, setTradeModalQuantity] = useState<number | undefined>(undefined);
  const [tradeModalIsSellAll, setTradeModalIsSellAll] = useState(false);

  const [inspectedStock, setInspectedStock] = useState<StockHolding | null>(null);
  const [holdingsSubView, setHoldingsSubView] = useState<'all' | 'heatmap' | 'table'>('all');

  // Live Market Price Fluctuation Simulator
  const [isSimulating, setIsSimulating] = useState(true);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('protrade_holdings', JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem('protrade_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('protrade_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('protrade_statements', JSON.stringify(statements));
  }, [statements]);

  // Dynamic Portfolio Calculations
  const totals: PortfolioTotals = useMemo(() => {
    const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
    const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalUnrealizedPl = totalCurrentValue - totalInvestment;
    const totalUnrealizedPlPercent = totalInvestment > 0 ? (totalUnrealizedPl / totalInvestment) * 100 : 0;

    const todayChange = holdings.reduce((sum, h) => sum + h.change * h.qty, 0);
    const todayChangePercent = totalInvestment > 0 ? (todayChange / totalInvestment) * 100 : 0;

    // Latest statement running balance is current cash balance
    const cashBalance = statements[statements.length - 1]?.runningBalance ?? 78084.63;
    const totalEquity = totalCurrentValue + cashBalance;

    const totalRealizedPl = trades.reduce((sum, t) => sum + (t.realizedPl || 0), 0);

    return {
      totalInvestment,
      totalCurrentValue,
      totalUnrealizedPl,
      totalUnrealizedPlPercent,
      todayChange,
      todayChangePercent,
      cashBalance,
      totalEquity,
      totalRealizedPl,
      totalTradesCount: trades.length,
    };
  }, [holdings, statements, trades]);

  // Recalculate portfolio weights whenever values update
  useEffect(() => {
    if (totals.totalCurrentValue <= 0) return;
    setHoldings((prev) => {
      let changed = false;
      const updated = prev.map((h) => {
        const newWeight = Number(((h.currentValue / totals.totalCurrentValue) * 100).toFixed(2));
        if (Math.abs(h.weight - newWeight) > 0.05) {
          changed = true;
          return { ...h, weight: newWeight };
        }
        return h;
      });
      return changed ? updated : prev;
    });
  }, [totals.totalCurrentValue]);

  // Simulated live market price ticks
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Pick 1-2 random holdings to tick
      setHoldings((prev) => {
        if (prev.length === 0) return prev;
        const randomIndex = Math.floor(Math.random() * prev.length);
        const target = prev[randomIndex];

        // Random price fluctuation between -0.5% and +0.5%
        const deltaFactor = (Math.random() - 0.48) * 0.012;
        const newPrice = Number(Math.max(1, target.currentPrice * (1 + deltaFactor)).toFixed(2));
        const priceDiff = Number((newPrice - target.currentPrice).toFixed(2));

        if (priceDiff === 0) return prev;

        const newChange = Number((target.change + priceDiff).toFixed(2));
        const prevClose = target.currentPrice - target.change;
        const newChangePercent = prevClose > 0 ? Number(((newChange / prevClose) * 100).toFixed(2)) : 0;
        const newCurrentValue = Number((target.qty * newPrice).toFixed(2));
        const newPl = Number((newCurrentValue - target.investment).toFixed(2));

        return prev.map((h, idx) => {
          if (idx === randomIndex) {
            return {
              ...h,
              currentPrice: newPrice,
              currentValue: newCurrentValue,
              change: newChange,
              changePercent: newChangePercent,
              low: Math.min(h.low, newPrice),
              high: Math.max(h.high, newPrice),
              pl: newPl,
              priceFlash: priceDiff > 0 ? 'up' : 'down',
            };
          }
          return h;
        });
      });

      // Clear flash after 1.1s
      setTimeout(() => {
        setHoldings((prev) => prev.map((h) => (h.priceFlash ? { ...h, priceFlash: null } : h)));
      }, 1100);
    }, 3800);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handle Trade Execution (Buy / Sell)
  const handleExecuteTrade = useCallback(
    (tradeData: {
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
    }) => {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8);
      const newTradeId = `TRD-${1000 + trades.length + 1}`;

      // 1. Create Trade Record
      const newTrade: TradeRecord = {
        id: newTradeId,
        date: dateStr,
        time: timeStr,
        symbol: tradeData.symbol,
        type: tradeData.type,
        lots: tradeData.lots,
        qty: tradeData.qty,
        price: tradeData.price,
        grossAmount: tradeData.grossAmount,
        commission: tradeData.commission,
        netCashFlow: tradeData.netCashFlow,
        realizedPl: tradeData.realizedPl,
        notes: tradeData.notes,
      };

      setTrades((prev) => [newTrade, ...prev]);

      // 2. Update Holdings
      setHoldings((prevHoldings) => {
        const existingIndex = prevHoldings.findIndex(
          (h) => h.symbol.toUpperCase() === tradeData.symbol.toUpperCase()
        );

        if (tradeData.type === 'BUY') {
          if (existingIndex >= 0) {
            // Recalculate average price and accumulate lots
            const existing = prevHoldings[existingIndex];
            const newTotalQty = existing.qty + tradeData.qty;
            const newTotalLots = existing.lots + tradeData.lots;
            const newTotalInvestment = existing.investment + tradeData.grossAmount;
            const newAvgPrice = Number((newTotalInvestment / newTotalQty).toFixed(2));
            const newCurrentValue = Number((newTotalQty * existing.currentPrice).toFixed(2));
            const newPl = Number((newCurrentValue - newTotalInvestment).toFixed(2));

            const updated = [...prevHoldings];
            updated[existingIndex] = {
              ...existing,
              qty: newTotalQty,
              lots: newTotalLots,
              avgPrice: newAvgPrice,
              investment: newTotalInvestment,
              currentValue: newCurrentValue,
              pl: newPl,
            };
            return updated;
          } else {
            // New holding
            const newInvestment = tradeData.grossAmount;
            const newCurrentValue = tradeData.grossAmount;
            const newHolding: StockHolding = {
              id: `hold-${Date.now()}`,
              mkt: 'REG',
              symbol: tradeData.symbol,
              sector: tradeData.sector || 'EQUITY',
              qty: tradeData.qty,
              lots: tradeData.lots,
              avgPrice: tradeData.price,
              investment: newInvestment,
              currentPrice: tradeData.price,
              currentValue: newCurrentValue,
              change: 0,
              changePercent: 0,
              tradeSignal: 'HOLD',
              volume: '100K',
              low: tradeData.price * 0.98,
              average: tradeData.price,
              high: tradeData.price * 1.02,
              pl: 0,
              weight: 5.0,
            };
            return [newHolding, ...prevHoldings];
          }
        } else {
          // SELL
          if (existingIndex >= 0) {
            const existing = prevHoldings[existingIndex];
            const remainingQty = existing.qty - tradeData.qty;

            if (remainingQty <= 0) {
              // Position completely closed / liquidated!
              return prevHoldings.filter((_, idx) => idx !== existingIndex);
            } else {
              const remainingLots = Math.max(1, existing.lots - tradeData.lots);
              const remainingInvestment = Number((remainingQty * existing.avgPrice).toFixed(2));
              const remainingCurrentValue = Number((remainingQty * existing.currentPrice).toFixed(2));
              const remainingPl = Number((remainingCurrentValue - remainingInvestment).toFixed(2));

              const updated = [...prevHoldings];
              updated[existingIndex] = {
                ...existing,
                qty: remainingQty,
                lots: remainingLots,
                investment: remainingInvestment,
                currentValue: remainingCurrentValue,
                pl: remainingPl,
              };
              return updated;
            }
          }
          return prevHoldings;
        }
      });

      // 3. Update Account Statement and Running Balance
      setStatements((prevStatements) => {
        const lastBalance = prevStatements[prevStatements.length - 1]?.runningBalance ?? 78084.63;
        const newBalance =
          tradeData.type === 'BUY'
            ? lastBalance - (tradeData.grossAmount + tradeData.commission)
            : lastBalance + (tradeData.grossAmount - tradeData.commission);

        const newStmt: StatementEntry = {
          id: `STMT-${String(prevStatements.length + 1).padStart(3, '0')}`,
          date: dateStr,
          time: timeStr,
          type: tradeData.type === 'BUY' ? 'BUY ORDER' : 'SELL ORDER',
          reference: `${newTradeId} / ${tradeData.symbol}`,
          description:
            tradeData.type === 'BUY'
              ? `Executed Buy ${tradeData.qty} shares of ${tradeData.symbol} @ ${tradeData.price.toFixed(2)}`
              : `Executed Sell ${tradeData.qty} shares of ${tradeData.symbol} @ ${tradeData.price.toFixed(2)}${
                  tradeData.realizedPl !== undefined
                    ? ` (Realized P/L: ${tradeData.realizedPl >= 0 ? '+' : ''}${tradeData.realizedPl.toFixed(2)})`
                    : ''
                }`,
          debit: tradeData.type === 'BUY' ? tradeData.grossAmount + tradeData.commission : 0,
          credit: tradeData.type === 'SELL' ? tradeData.grossAmount : 0,
          fee: tradeData.commission,
          netAmount: tradeData.netCashFlow,
          runningBalance: Number(newBalance.toFixed(2)),
        };

        return [...prevStatements, newStmt];
      });
    },
    [trades.length]
  );

  // Cash Ledger Actions
  const handleDepositFunds = (amount: number, description: string) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);

    setStatements((prev) => {
      const lastBalance = prev[prev.length - 1]?.runningBalance ?? 0;
      const newBalance = lastBalance + amount;
      const newStmt: StatementEntry = {
        id: `STMT-${String(prev.length + 1).padStart(3, '0')}`,
        date: dateStr,
        time: timeStr,
        type: 'DEPOSIT',
        reference: `DEP-${Date.now().toString().slice(-5)}`,
        description,
        debit: 0,
        credit: amount,
        fee: 0,
        netAmount: amount,
        runningBalance: Number(newBalance.toFixed(2)),
      };
      return [...prev, newStmt];
    });
  };

  const handleWithdrawFunds = (amount: number, description: string): boolean => {
    const lastBalance = statements[statements.length - 1]?.runningBalance ?? 0;
    if (amount > lastBalance) return false;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);

    setStatements((prev) => {
      const newBalance = lastBalance - amount;
      const newStmt: StatementEntry = {
        id: `STMT-${String(prev.length + 1).padStart(3, '0')}`,
        date: dateStr,
        time: timeStr,
        type: 'WITHDRAWAL',
        reference: `WTH-${Date.now().toString().slice(-5)}`,
        description,
        debit: amount,
        credit: 0,
        fee: 0,
        netAmount: -amount,
        runningBalance: Number(newBalance.toFixed(2)),
      };
      return [...prev, newStmt];
    });

    return true;
  };

  // Watchlist Actions
  const handleAddToWatchlist = (item: Omit<WatchlistItem, 'id'>) => {
    const newItem: WatchlistItem = {
      ...item,
      id: `wl-${Date.now()}`,
    };
    setWatchlist((prev) => [newItem, ...prev]);
  };

  const handleRemoveFromWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((w) => w.id !== id));
  };

  // Quick Action Triggers from Table
  const handleBuyClick = (symbol: string) => {
    setTradeModalType('BUY');
    setTradeModalSymbol(symbol);
    setTradeModalQuantity(10);
    setTradeModalIsSellAll(false);
    setIsTradeModalOpen(true);
  };

  const handleSellPartialClick = (symbol: string, qty: number) => {
    setTradeModalType('SELL');
    setTradeModalSymbol(symbol);
    setTradeModalQuantity(qty);
    setTradeModalIsSellAll(false);
    setIsTradeModalOpen(true);
  };

  const handleSellAllClick = (symbol: string) => {
    const target = holdings.find((h) => h.symbol === symbol);
    setTradeModalType('SELL');
    setTradeModalSymbol(symbol);
    setTradeModalQuantity(target?.qty);
    setTradeModalIsSellAll(true);
    setIsTradeModalOpen(true);
  };

  const handleExportExcel = () => {
    exportPortfolioToExcel(holdings, trades, watchlist, statements, totals);
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#E4E4E7] flex flex-col font-sans">
      {/* 3-Zone Top Navigation Contract */}
      <HeaderNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenTradeModal={() => {
          setTradeModalType('BUY');
          setTradeModalSymbol(holdings[0]?.symbol || 'FFC');
          setTradeModalQuantity(10);
          setTradeModalIsSellAll(false);
          setIsTradeModalOpen(true);
        }}
        onExportExcel={handleExportExcel}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Executive KPI Summary Bar */}
        <PortfolioSummaryCards
          totals={totals}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
          onRefreshPrices={() => {}}
        />

        {/* View Switcher Content */}
        {currentTab === 'holdings' && (
          <div className="space-y-5">
            {/* Holdings View Controls: Heatmap vs Table vs All */}
            <div className="flex items-center justify-between bg-[#18191d] border border-neutral-800 rounded-lg px-4 py-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-medium">Holdings Display:</span>
                <div className="flex items-center bg-[#121316] rounded border border-neutral-800 p-0.5">
                  <button
                    onClick={() => setHoldingsSubView('all')}
                    className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                      holdingsSubView === 'all'
                        ? 'bg-neutral-700 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Heatmap + Table
                  </button>
                  <button
                    onClick={() => setHoldingsSubView('heatmap')}
                    className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                      holdingsSubView === 'heatmap'
                        ? 'bg-emerald-800 text-emerald-100 shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    D3 Heatmap
                  </button>
                  <button
                    onClick={() => setHoldingsSubView('table')}
                    className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                      holdingsSubView === 'table'
                        ? 'bg-neutral-700 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Table Only
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 hidden sm:block">
                Box size = Market Cap · Color = Gain/Loss
              </div>
            </div>

            {/* D3 Treemap Heatmap */}
            {(holdingsSubView === 'all' || holdingsSubView === 'heatmap') && (
              <PortfolioHeatmap
                holdings={holdings}
                onSelectStock={(holding) => setInspectedStock(holding)}
                onBuyClick={handleBuyClick}
              />
            )}

            {/* Holdings Table */}
            {(holdingsSubView === 'all' || holdingsSubView === 'table') && (
              <HoldingsTable
                holdings={holdings}
                onBuyClick={handleBuyClick}
                onSellAllClick={handleSellAllClick}
                onSellPartialClick={handleSellPartialClick}
                onInspectStock={(holding) => setInspectedStock(holding)}
              />
            )}

            {/* Quick Watchlist Teaser Bar at the bottom of Holdings */}
            <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-bold">Watchlist Radar:</span>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {watchlist.slice(0, 4).map((w) => (
                    <button
                      key={w.id}
                      onClick={() => handleBuyClick(w.symbol)}
                      className="px-2.5 py-1 rounded bg-[#131417] hover:bg-[#1f2127] border border-neutral-800 text-neutral-200 flex items-center gap-1.5 transition-colors"
                    >
                      <span className="font-bold">{w.symbol}</span>
                      <span className="text-neutral-400">{w.currentPrice.toFixed(2)}</span>
                      <span className={`text-[10px] ${w.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {w.change >= 0 ? `+${w.changePercent.toFixed(1)}%` : `${w.changePercent.toFixed(1)}%`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('watchlist')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                View Full Watchlist ({watchlist.length}) →
              </button>
            </div>
          </div>
        )}

        {currentTab === 'watchlist' && (
          <WatchlistSection
            watchlist={watchlist}
            onQuickBuy={handleBuyClick}
            onAddToWatchlist={handleAddToWatchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
          />
        )}

        {currentTab === 'statement' && (
          <AccountStatementView
            statements={statements}
            totals={totals}
            onDepositFunds={handleDepositFunds}
            onWithdrawFunds={handleWithdrawFunds}
            onExportExcel={handleExportExcel}
          />
        )}

        {currentTab === 'trades' && (
          <TradeLogView
            trades={trades}
            onOpenTradeModal={() => {
              setTradeModalType('BUY');
              setTradeModalSymbol(holdings[0]?.symbol || 'FFC');
              setTradeModalQuantity(10);
              setTradeModalIsSellAll(false);
              setIsTradeModalOpen(true);
            }}
          />
        )}

        {currentTab === 'excel' && (
          <ExcelFormulaViewer
            holdings={holdings}
            trades={trades}
            watchlist={watchlist}
            statements={statements}
            totals={totals}
          />
        )}
      </main>

      {/* Footer info bar */}
      <footer className="border-t border-neutral-800/80 bg-[#141518] py-3 text-xs text-neutral-500 font-mono">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>PROTRADE FINANCIAL ARCHITECTURE</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Buy & Sell Auto-Update</span>
            <span aria-hidden="true">·</span>
            <span>Dynamic Multi-Sheet Excel Engine</span>
          </div>
          <div>
            Last Reconciliation: <span className="text-neutral-400">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </footer>

      {/* Trade Execution Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        initialType={tradeModalType}
        initialSymbol={tradeModalSymbol}
        initialQuantity={tradeModalQuantity}
        isSellAll={tradeModalIsSellAll}
        holdings={holdings}
        watchlist={watchlist}
        cashBalance={totals.cashBalance}
        onExecuteTrade={handleExecuteTrade}
      />

      {/* Stock Details & Technical Modal */}
      <StockDetailsModal
        holding={inspectedStock}
        onClose={() => setInspectedStock(null)}
        onBuyMore={handleBuyClick}
        onSellShares={handleSellPartialClick}
        onLiquidateAll={handleSellAllClick}
      />
    </div>
  );
}
