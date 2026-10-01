import React, { useState } from 'react';
import { StockHolding, TradeRecord, WatchlistItem, StatementEntry, PortfolioTotals } from '../types/stock';
import { Download, FileSpreadsheet, Copy, Check, Info, Table, Calculator } from 'lucide-react';
import { exportPortfolioToExcel } from '../utils/excelGenerator';

interface ExcelFormulaViewerProps {
  holdings: StockHolding[];
  trades: TradeRecord[];
  watchlist: WatchlistItem[];
  statements: StatementEntry[];
  totals: PortfolioTotals;
}

type SheetTab = 'holdings' | 'trades' | 'watchlist' | 'statement' | 'formulas';

interface SelectedCellInfo {
  cellRef: string;
  sheet: string;
  formula: string;
  value: string;
  explanation: string;
}

export const ExcelFormulaViewer: React.FC<ExcelFormulaViewerProps> = ({
  holdings,
  trades,
  watchlist,
  statements,
  totals,
}) => {
  const [activeSheet, setActiveSheet] = useState<SheetTab>('holdings');
  const [copied, setCopied] = useState(false);
  const [selectedCell, setSelectedCell] = useState<SelectedCellInfo>({
    cellRef: 'G4',
    sheet: 'Holdings_Portfolio',
    formula: '=D4*F4',
    value: holdings[0]?.investment.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '15,992.21',
    explanation: 'Calculates the Total Investment by multiplying Quantity (Col D) by Average Buy Price (Col F).',
  });

  const handleCopyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    exportPortfolioToExcel(holdings, trades, watchlist, statements, totals);
  };

  const selectCell = (
    cellRef: string,
    sheet: string,
    formula: string,
    value: string | number,
    explanation: string
  ) => {
    setSelectedCell({
      cellRef,
      sheet,
      formula,
      value: String(value),
      explanation,
    });
  };

  return (
    <div className="bg-[#18191d] border border-neutral-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
      {/* Top Excel Ribbon Bar */}
      <div className="bg-[#1e2025] px-4 py-2.5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-100">Live Excel Formula Engine & Workbook</span>
              <span className="text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">.XLSX ACTIVE</span>
            </div>
            <p className="text-xs text-neutral-400">Click any green-tagged formula cell to inspect or copy its native Excel formula</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .XLSX File</span>
          </button>
        </div>
      </div>

      {/* Formula Bar (Authentic Excel fx Bar) */}
      <div className="bg-[#151619] px-4 py-2 border-b border-neutral-800 flex items-center gap-3">
        {/* Cell Reference Box */}
        <div className="flex items-center gap-1.5 bg-[#23262d] border border-neutral-700/80 rounded px-2.5 py-1 text-xs font-mono font-semibold text-emerald-400 min-w-[70px] justify-center">
          <span>{selectedCell.cellRef}</span>
        </div>

        {/* fx symbol */}
        <div className="flex items-center gap-1 text-neutral-400 text-xs font-serif font-bold italic select-none">
          <Calculator className="w-3.5 h-3.5 text-neutral-400" />
          <span>fx</span>
        </div>

        {/* Formula Input / Display */}
        <div className="flex-1 bg-[#1a1b1f] border border-neutral-700/70 rounded px-3 py-1 text-xs font-mono text-neutral-100 flex items-center justify-between overflow-x-auto">
          <span className="text-emerald-300 font-medium whitespace-nowrap">{selectedCell.formula}</span>
          <button
            onClick={() => handleCopyFormula(selectedCell.formula)}
            className="ml-2 text-neutral-400 hover:text-white flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded hover:bg-neutral-800 transition-colors"
            title="Copy formula"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Formula Explanation Callout */}
      <div className="bg-[#1b1d22] px-4 py-1.5 border-b border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-300">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="text-neutral-400">Formula Analysis:</span>
        <span className="font-medium text-neutral-200">{selectedCell.explanation}</span>
        <span className="text-neutral-400 ml-auto font-mono text-[11px]">Evaluated: {selectedCell.value}</span>
      </div>

      {/* Sheet Tabs */}
      <div className="bg-[#141518] px-4 border-b border-neutral-800 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSheet('holdings')}
          className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeSheet === 'holdings'
              ? 'border-emerald-500 text-emerald-400 bg-[#1e2025]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Sheet 1: Holdings_Portfolio</span>
        </button>

        <button
          onClick={() => setActiveSheet('trades')}
          className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeSheet === 'trades'
              ? 'border-emerald-500 text-emerald-400 bg-[#1e2025]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Sheet 2: Trade_Log_Ledger</span>
        </button>

        <button
          onClick={() => setActiveSheet('watchlist')}
          className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeSheet === 'watchlist'
              ? 'border-emerald-500 text-emerald-400 bg-[#1e2025]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Sheet 3: Watchlist</span>
        </button>

        <button
          onClick={() => setActiveSheet('statement')}
          className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeSheet === 'statement'
              ? 'border-emerald-500 text-emerald-400 bg-[#1e2025]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Sheet 4: Account_Statement</span>
        </button>

        <button
          onClick={() => setActiveSheet('formulas')}
          className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
            activeSheet === 'formulas'
              ? 'border-emerald-500 text-emerald-400 bg-[#1e2025]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Formula Master Reference Guide</span>
        </button>
      </div>

      {/* Grid Content Area */}
      <div className="overflow-x-auto max-h-[460px]">
        {activeSheet === 'holdings' && (
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#121316] text-neutral-400 border-b border-neutral-800">
                <th className="py-2 px-3 text-center border-r border-neutral-800 bg-[#1a1c20] text-neutral-500 w-12">#</th>
                <th className="py-2 px-3 border-r border-neutral-800">A (MKT)</th>
                <th className="py-2 px-3 border-r border-neutral-800">B (SYMBOL)</th>
                <th className="py-2 px-3 border-r border-neutral-800">C (SECTOR)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">D (QTY)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">E (LOTS)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">F (AVG PRICE)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">G (INVESTMENT) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">H (CURRENT PRICE)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">I (CURRENT VALUE) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">J (CHANGE)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">K (% CHANGE) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">Q (P/L) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">R (WEIGHT) fx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {holdings.map((h, i) => {
                const row = 4 + i;
                const isSelectedG = selectedCell.cellRef === `G${row}`;
                const isSelectedI = selectedCell.cellRef === `I${row}`;
                const isSelectedQ = selectedCell.cellRef === `Q${row}`;
                const isSelectedR = selectedCell.cellRef === `R${row}`;

                return (
                  <tr key={h.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-2 px-3 text-center border-r border-neutral-800 bg-[#15161a] text-neutral-500 font-semibold">{row}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-neutral-300">{h.mkt}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 font-bold text-neutral-100">{h.symbol}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-neutral-400 truncate max-w-[140px]">{h.sector}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-neutral-200">{h.qty}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-neutral-300">{h.lots}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-neutral-300">{h.avgPrice.toFixed(2)}</td>

                    {/* Investment with Formula */}
                    <td
                      onClick={() =>
                        selectCell(
                          `G${row}`,
                          'Holdings_Portfolio',
                          `=D${row}*F${row}`,
                          h.investment.toFixed(2),
                          `Calculates holding investment: Quantity (D${row}) * Average Buy Price (F${row}).`
                        )
                      }
                      className={`py-2 px-3 border-r border-neutral-800 text-right cursor-pointer group transition-colors ${
                        isSelectedG ? 'bg-emerald-950/60 ring-1 ring-emerald-500 text-emerald-300' : 'text-neutral-100 hover:bg-emerald-950/30'
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-emerald-500 opacity-60 group-hover:opacity-100">fx</span>
                        <span>{h.investment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </td>

                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-neutral-200">{h.currentPrice.toFixed(2)}</td>

                    {/* Current Value with Formula */}
                    <td
                      onClick={() =>
                        selectCell(
                          `I${row}`,
                          'Holdings_Portfolio',
                          `=D${row}*H${row}`,
                          h.currentValue.toFixed(2),
                          `Calculates real-time market value: Quantity (D${row}) * Current Market Price (H${row}).`
                        )
                      }
                      className={`py-2 px-3 border-r border-neutral-800 text-right cursor-pointer group transition-colors ${
                        isSelectedI ? 'bg-emerald-950/60 ring-1 ring-emerald-500 text-emerald-300' : 'text-neutral-100 hover:bg-emerald-950/30'
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-emerald-500 opacity-60 group-hover:opacity-100">fx</span>
                        <span>{h.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </td>

                    <td className={`py-2 px-3 border-r border-neutral-800 text-right ${h.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.change > 0 ? `+${h.change.toFixed(2)}` : h.change.toFixed(2)}
                    </td>

                    {/* % Change */}
                    <td className={`py-2 px-3 border-r border-neutral-800 text-right ${h.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.changePercent > 0 ? `+${h.changePercent.toFixed(2)}%` : `${h.changePercent.toFixed(2)}%`}
                    </td>

                    {/* P/L with Formula */}
                    <td
                      onClick={() =>
                        selectCell(
                          `Q${row}`,
                          'Holdings_Portfolio',
                          `=I${row}-G${row}`,
                          h.pl.toFixed(2),
                          `Calculates unrealized Profit/Loss: Current Value (I${row}) - Total Investment (G${row}).`
                        )
                      }
                      className={`py-2 px-3 border-r border-neutral-800 text-right cursor-pointer group transition-colors ${
                        isSelectedQ ? 'bg-emerald-950/60 ring-1 ring-emerald-500' : 'hover:bg-neutral-800'
                      } ${h.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-neutral-400 group-hover:text-emerald-400">fx</span>
                        <span>{h.pl > 0 ? `+${h.pl.toFixed(2)}` : h.pl.toFixed(2)}</span>
                      </div>
                    </td>

                    {/* Weight with Formula */}
                    <td
                      onClick={() =>
                        selectCell(
                          `R${row}`,
                          'Holdings_Portfolio',
                          `=I${row}/$I$15`,
                          `${h.weight.toFixed(2)}%`,
                          `Dynamic Portfolio Weight: Holding Current Value (I${row}) divided by absolute total value ($I$15).`
                        )
                      }
                      className={`py-2 px-3 border-r border-neutral-800 text-right cursor-pointer group transition-colors ${
                        isSelectedR ? 'bg-emerald-950/60 ring-1 ring-emerald-500 text-emerald-300' : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-neutral-400 group-hover:text-emerald-400">fx</span>
                        <span>{h.weight.toFixed(2)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-[#1b1c20] font-bold text-neutral-100 border-t-2 border-neutral-700">
                <td className="py-2.5 px-3 text-center border-r border-neutral-800 bg-[#15161a] text-neutral-400 font-mono">15</td>
                <td className="py-2.5 px-3 border-r border-neutral-800 text-amber-400">TOTALS</td>
                <td className="py-2.5 px-3 border-r border-neutral-800 text-neutral-400">—</td>
                <td className="py-2.5 px-3 border-r border-neutral-800 text-neutral-400">—</td>
                <td className="py-2.5 px-3 border-r border-neutral-800 text-right">{holdings.reduce((s, x) => s + x.qty, 0)}</td>
                <td className="py-2.5 px-3 border-r border-neutral-800 text-right">{holdings.reduce((s, x) => s + x.lots, 0)}</td>
                <td className="py-2.5 px-3 border-r border-neutral-800 text-right text-neutral-400">—</td>

                {/* Total Investment fx */}
                <td
                  onClick={() =>
                    selectCell(
                      'G15',
                      'Holdings_Portfolio',
                      '=SUM(G4:G14)',
                      totals.totalInvestment.toFixed(2),
                      'Aggregates total capital deployed across all portfolio positions using SUM range.'
                    )
                  }
                  className="py-2.5 px-3 border-r border-neutral-800 text-right cursor-pointer text-emerald-300 hover:bg-emerald-950/40"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px] text-emerald-400">fx</span>
                    <span>{totals.totalInvestment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </td>

                <td className="py-2.5 px-3 border-r border-neutral-800 text-right text-neutral-400">—</td>

                {/* Total Current Value fx */}
                <td
                  onClick={() =>
                    selectCell(
                      'I15',
                      'Holdings_Portfolio',
                      '=SUM(I4:I14)',
                      totals.totalCurrentValue.toFixed(2),
                      'Total current market valuation of the portfolio using SUM range.'
                    )
                  }
                  className="py-2.5 px-3 border-r border-neutral-800 text-right cursor-pointer text-emerald-300 hover:bg-emerald-950/40"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px] text-emerald-400">fx</span>
                    <span>{totals.totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </td>

                <td className="py-2.5 px-3 border-r border-neutral-800 text-right text-neutral-400">—</td>

                {/* Overall Return % */}
                <td
                  onClick={() =>
                    selectCell(
                      'K15',
                      'Holdings_Portfolio',
                      '=IF(G15>0, Q15/G15, 0)',
                      `${totals.totalUnrealizedPlPercent.toFixed(2)}%`,
                      'Overall Portfolio Return Percentage: Total Unrealized P/L (Q15) divided by Total Investment (G15).'
                    )
                  }
                  className="py-2.5 px-3 border-r border-neutral-800 text-right cursor-pointer text-rose-400 hover:bg-neutral-800"
                >
                  {totals.totalUnrealizedPlPercent.toFixed(2)}%
                </td>

                {/* Total P/L fx */}
                <td
                  onClick={() =>
                    selectCell(
                      'Q15',
                      'Holdings_Portfolio',
                      '=SUM(Q4:Q14)',
                      totals.totalUnrealizedPl.toFixed(2),
                      'Total Portfolio Unrealized P/L using SUM range of all position gains and losses.'
                    )
                  }
                  className={`py-2.5 px-3 border-r border-neutral-800 text-right cursor-pointer hover:bg-neutral-800 ${
                    totals.totalUnrealizedPl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px] text-neutral-400">fx</span>
                    <span>{totals.totalUnrealizedPl.toFixed(2)}</span>
                  </div>
                </td>

                {/* Total Weight */}
                <td
                  onClick={() =>
                    selectCell(
                      'R15',
                      'Holdings_Portfolio',
                      '=SUM(R4:R14)',
                      '100.00%',
                      'Sums all position weights to ensure complete 100% portfolio allocation integrity.'
                    )
                  }
                  className="py-2.5 px-3 border-r border-neutral-800 text-right cursor-pointer text-neutral-200 hover:bg-neutral-800"
                >
                  100.00%
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {activeSheet === 'trades' && (
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#121316] text-neutral-400 border-b border-neutral-800">
                <th className="py-2 px-3 border-r border-neutral-800 bg-[#1a1c20] text-neutral-500 w-12 text-center">#</th>
                <th className="py-2 px-3 border-r border-neutral-800">A (ID)</th>
                <th className="py-2 px-3 border-r border-neutral-800">B (DATE)</th>
                <th className="py-2 px-3 border-r border-neutral-800">C (SYMBOL)</th>
                <th className="py-2 px-3 border-r border-neutral-800">D (ACTION)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">E (LOTS)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">F (QTY)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">G (PRICE)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">H (GROSS) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">I (COMM 0.15%) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">J (NET CASH FLOW) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">K (REALIZED P/L) fx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {trades.map((t, i) => {
                const r = 4 + i;
                return (
                  <tr key={t.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-2 px-3 text-center border-r border-neutral-800 bg-[#15161a] text-neutral-500 font-semibold">{r}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-neutral-400">{t.id}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-neutral-300">{t.date}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 font-bold text-neutral-100">{t.symbol}</td>
                    <td className="py-2 px-3 border-r border-neutral-800">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${t.type === 'BUY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-neutral-300">{t.lots}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-neutral-200">{t.qty}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-neutral-200">{t.price.toFixed(2)}</td>

                    {/* Gross */}
                    <td
                      onClick={() =>
                        selectCell(
                          `H${r}`,
                          'Trade_Log_Ledger',
                          `=F${r}*G${r}`,
                          t.grossAmount.toFixed(2),
                          `Calculates Gross Trade Value: Shares (F${r}) * Execution Price (G${r}).`
                        )
                      }
                      className="py-2 px-3 border-r border-neutral-800 text-right cursor-pointer text-emerald-300 hover:bg-emerald-950/40"
                    >
                      {t.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Commission */}
                    <td
                      onClick={() =>
                        selectCell(
                          `I${r}`,
                          'Trade_Log_Ledger',
                          `=ROUND(H${r}*0.0015, 2)`,
                          t.commission.toFixed(2),
                          `Brokerage transaction fee: 0.15% applied to Gross Amount rounded to 2 decimal places.`
                        )
                      }
                      className="py-2 px-3 border-r border-neutral-800 text-right cursor-pointer text-neutral-300 hover:bg-neutral-800"
                    >
                      {t.commission.toFixed(2)}
                    </td>

                    {/* Net Cash Flow */}
                    <td
                      onClick={() =>
                        selectCell(
                          `J${r}`,
                          'Trade_Log_Ledger',
                          `=IF(D${r}="BUY", -(H${r}+I${r}), (H${r}-I${r}))`,
                          t.netCashFlow.toFixed(2),
                          `Net cash movement: Deducts purchase plus fee on BUY, or credits proceeds minus fee on SELL.`
                        )
                      }
                      className={`py-2 px-3 border-r border-neutral-800 text-right cursor-pointer hover:bg-neutral-800 ${
                        t.netCashFlow >= 0 ? 'text-emerald-400' : 'text-neutral-300'
                      }`}
                    >
                      {t.netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Realized P/L */}
                    <td
                      onClick={() =>
                        selectCell(
                          `K${r}`,
                          'Trade_Log_Ledger',
                          `=IF(D${r}="SELL", (G${r}-XLOOKUP(C${r}, Holdings_Portfolio!$B$4:$B$14, Holdings_Portfolio!$F$4:$F$14))*F${r}-I${r}, 0)`,
                          (t.realizedPl || 0).toFixed(2),
                          `Realized capital gain on SELL order: Uses XLOOKUP to match cost basis against Holdings sheet.`
                        )
                      }
                      className="py-2 px-3 border-r border-neutral-800 text-right cursor-pointer text-emerald-400 hover:bg-neutral-800"
                    >
                      {t.realizedPl !== undefined ? `+${t.realizedPl.toFixed(2)}` : '0.00'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeSheet === 'watchlist' && (
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#121316] text-neutral-400 border-b border-neutral-800">
                <th className="py-2 px-3 border-r border-neutral-800 bg-[#1a1c20] text-neutral-500 w-12 text-center">#</th>
                <th className="py-2 px-3 border-r border-neutral-800">A (SYMBOL)</th>
                <th className="py-2 px-3 border-r border-neutral-800">B (COMPANY)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">C (TARGET BUY)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">D (CURRENT PRICE)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">E (DAY CHG) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">F (% CHG) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-emerald-400">G (TRIGGER LOGIC) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">H (DISCOUNT %) fx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {watchlist.map((w, i) => {
                const r = 4 + i;
                const discount = ((w.currentPrice - w.targetBuyPrice) / w.targetBuyPrice) * 100;
                return (
                  <tr key={w.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-2 px-3 text-center border-r border-neutral-800 bg-[#15161a] text-neutral-500 font-semibold">{r}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 font-bold text-neutral-100">{w.symbol}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-neutral-300">{w.companyName}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-amber-400 font-semibold">{w.targetBuyPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-neutral-100">{w.currentPrice.toFixed(2)}</td>
                    <td className={`py-2 px-3 border-r border-neutral-800 text-right ${w.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {w.change > 0 ? `+${w.change.toFixed(2)}` : w.change.toFixed(2)}
                    </td>
                    <td className={`py-2 px-3 border-r border-neutral-800 text-right ${w.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {w.changePercent > 0 ? `+${w.changePercent.toFixed(2)}%` : `${w.changePercent.toFixed(2)}%`}
                    </td>
                    <td
                      onClick={() =>
                        selectCell(
                          `G${r}`,
                          'Watchlist',
                          `=IF(D${r}<=C${r}, "BUY TARGET HIT", IF(D${r}<=C${r}*1.03, "NEAR BUY ZONE", "MONITORING"))`,
                          w.currentPrice <= w.targetBuyPrice ? 'BUY TARGET HIT' : 'MONITORING',
                          `Trigger rule: If Current Price (D${r}) is <= Target (C${r}), automatically emits BUY TARGET HIT.`
                        )
                      }
                      className="py-2 px-3 border-r border-neutral-800 cursor-pointer text-emerald-400 hover:bg-neutral-800"
                    >
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                        {w.currentPrice <= w.targetBuyPrice ? 'BUY TARGET HIT' : 'MONITORING'}
                      </span>
                    </td>
                    <td
                      onClick={() =>
                        selectCell(
                          `H${r}`,
                          'Watchlist',
                          `=(D${r}-C${r})/C${r}`,
                          `${discount.toFixed(2)}%`,
                          `Percentage spread between current trading price and target acquisition entry price.`
                        )
                      }
                      className="py-2 px-3 border-r border-neutral-800 text-right cursor-pointer text-neutral-300 hover:bg-neutral-800"
                    >
                      {discount > 0 ? `+${discount.toFixed(1)}%` : `${discount.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeSheet === 'statement' && (
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#121316] text-neutral-400 border-b border-neutral-800">
                <th className="py-2 px-3 border-r border-neutral-800 bg-[#1a1c20] text-neutral-500 w-12 text-center">#</th>
                <th className="py-2 px-3 border-r border-neutral-800">A (STMT ID)</th>
                <th className="py-2 px-3 border-r border-neutral-800">B (DATE)</th>
                <th className="py-2 px-3 border-r border-neutral-800">C (TYPE)</th>
                <th className="py-2 px-3 border-r border-neutral-800">D (DESCRIPTION)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">E (DEBIT)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right">F (CREDIT)</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">G (NET CASH) fx</th>
                <th className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">H (RUNNING BAL) fx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {statements.map((s, i) => {
                const r = 4 + i;
                return (
                  <tr key={s.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-2 px-3 text-center border-r border-neutral-800 bg-[#15161a] text-neutral-500 font-semibold">{r}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-neutral-400">{s.id}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-neutral-300">{s.date}</td>
                    <td className="py-2 px-3 border-r border-neutral-800">
                      <span className="text-[11px] font-semibold text-neutral-200">{s.type}</span>
                    </td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-neutral-400 truncate max-w-[200px]">{s.description}</td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-rose-400">
                      {s.debit > 0 ? s.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-2 px-3 border-r border-neutral-800 text-right text-emerald-400">
                      {s.credit > 0 ? s.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td
                      onClick={() =>
                        selectCell(
                          `G${r}`,
                          'Account_Statement',
                          `=F${r}-E${r}`,
                          s.netAmount.toFixed(2),
                          `Calculates Net Flow: Credit (Inflow F${r}) minus Debit (Outflow E${r}).`
                        )
                      }
                      className={`py-2 px-3 border-r border-neutral-800 text-right cursor-pointer hover:bg-neutral-800 ${
                        s.netAmount >= 0 ? 'text-emerald-400' : 'text-neutral-300'
                      }`}
                    >
                      {s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      onClick={() =>
                        selectCell(
                          `H${r}`,
                          'Account_Statement',
                          i === 0 ? `=G${r}` : `=H${r - 1}+G${r}`,
                          s.runningBalance.toFixed(2),
                          `Running Cash Balance: Adds current net flow (G${r}) to preceding balance (H${r - 1}).`
                        )
                      }
                      className="py-2 px-3 border-r border-neutral-800 text-right cursor-pointer text-emerald-300 font-bold hover:bg-emerald-950/40"
                    >
                      {s.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeSheet === 'formulas' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#141518] p-4 rounded border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">INDEX + MATCH</span>
                  <span className="text-[11px] text-neutral-400">Best Performer Lookup</span>
                </div>
                <div className="bg-[#1b1c20] p-2 rounded text-xs font-mono text-neutral-200">
                  =INDEX(B4:B14, MATCH(MAX(Q4:Q14), Q4:Q14, 0))
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Dynamic two-way lookup that scans column Q (P/L) to find the absolute maximum profit, and returns the corresponding stock ticker symbol from column B.
                </p>
              </div>

              <div className="bg-[#141518] p-4 rounded border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">XLOOKUP / VLOOKUP</span>
                  <span className="text-[11px] text-neutral-400">Cross-Sheet Cost Basis</span>
                </div>
                <div className="bg-[#1b1c20] p-2 rounded text-xs font-mono text-neutral-200">
                  =VLOOKUP(C4, Holdings_Portfolio!$B$4:$F$50, 5, FALSE)
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Extracts historical average buy price when executing a SELL trade in the Trade Log sheet to compute true realized capital gains.
                </p>
              </div>

              <div className="bg-[#141518] p-4 rounded border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">SUMIF & DIVERSIFICATION</span>
                  <span className="text-[11px] text-neutral-400">Sector Aggregates</span>
                </div>
                <div className="bg-[#1b1c20] p-2 rounded text-xs font-mono text-neutral-200">
                  =SUMIF(C4:C14, "FERTILIZER", I4:I14)
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Calculates total monetary exposure to a specific industry sector by filtering rows where Sector matches the target criteria.
                </p>
              </div>

              <div className="bg-[#141518] p-4 rounded border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">COUNTIF PERFORMANCE RATIO</span>
                  <span className="text-[11px] text-neutral-400">Win Rate Analytic</span>
                </div>
                <div className="bg-[#1b1c20] p-2 rounded text-xs font-mono text-neutral-200">
                  =COUNTIF(Q4:Q14, "&gt;0") / MAX(1, COUNTIF(Q4:Q14, "&lt;0"))
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Counts winning positions vs losing positions and protects against divide-by-zero errors using the MAX function.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="bg-[#141518] px-4 py-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500 font-mono">
        <div>Ready · 100% Calculated · Multi-Sheet Linked</div>
        <div className="flex items-center gap-3">
          <span>Total Holdings: {holdings.length}</span>
          <span>Cash: {totals.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} PKR</span>
          <span>NAV: {totals.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })} PKR</span>
        </div>
      </div>
    </div>
  );
};
