import * as XLSX from 'xlsx';
import { StockHolding, TradeRecord, WatchlistItem, StatementEntry, PortfolioTotals } from '../types/stock';

/**
 * Creates and downloads a professional multi-sheet Excel (.xlsx) workbook
 * containing REAL advanced formulas for portfolio valuation, weights,
 * realized/unrealized P&L, trade cashflows, and account balances.
 */
export function exportPortfolioToExcel(
  holdings: StockHolding[],
  trades: TradeRecord[],
  watchlist: WatchlistItem[],
  statements: StatementEntry[],
  totals: PortfolioTotals
) {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: HOLDINGS PORTFOLIO WITH FORMULAS
  // ==========================================
  const holdingsSheetData: Array<Array<string | number | { t: string; f?: string; v?: string | number }>> = [
    ['MY PORTFOLIO — HOLDINGS & VALUATION MODEL'],
    ['Generated on:', new Date().toLocaleString(), '', '', '', '', '', '', '', '', '', '', ''],
    [
      'MKT',
      'SYMBOL',
      'SECTOR',
      'QTY',
      'LOTS',
      'AVG PRICE',
      'INVESTMENT',
      'CURRENT PRICE',
      'CURRENT VALUE',
      'DAILY CHANGE',
      '% CHANGE',
      'SIGNAL',
      'VOLUME',
      'LOW',
      'AVERAGE',
      'HIGH',
      'P/L',
      'PORTFOLIO WEIGHT',
    ],
  ];

  const headerRowIndex = 3; // 1-indexed Excel row 3
  const startRow = 4; // 1-indexed Excel row 4
  const endRow = startRow + holdings.length - 1;
  const totalRowIndex = endRow + 1;

  // Insert holdings rows
  holdings.forEach((h, index) => {
    const excelRow = startRow + index;
    holdingsSheetData.push([
      h.mkt,
      h.symbol,
      h.sector,
      h.qty, // Col D (QTY)
      h.lots, // Col E (LOTS)
      h.avgPrice, // Col F (AVG PRICE)
      // INVESTMENT = QTY * AVG PRICE -> Formula =D{row}*F{row}
      { t: 'n', f: `D${excelRow}*F${excelRow}`, v: Number((h.qty * h.avgPrice).toFixed(2)) }, // Col G
      h.currentPrice, // Col H (CURRENT PRICE)
      // CURRENT VALUE = QTY * CURRENT PRICE -> Formula =D{row}*H{row}
      { t: 'n', f: `D${excelRow}*H${excelRow}`, v: Number((h.qty * h.currentPrice).toFixed(2)) }, // Col I
      h.change, // Col J
      h.changePercent / 100, // Col K
      h.tradeSignal, // Col L
      h.volume, // Col M
      h.low, // Col N
      h.average, // Col O
      h.high, // Col P
      // P/L = CURRENT VALUE - INVESTMENT -> Formula =I{row}-G{row}
      { t: 'n', f: `I${excelRow}-G${excelRow}`, v: Number(h.pl.toFixed(2)) }, // Col Q
      // WEIGHT = CURRENT VALUE / TOTAL CURRENT VALUE -> Formula =I{row}/$I${totalRowIndex}
      { t: 'n', f: `I${excelRow}/$I$${totalRowIndex}`, v: Number((h.weight / 100).toFixed(4)) }, // Col R
    ]);
  });

  // Summary Total Row
  holdingsSheetData.push([
    'TOTALS',
    '',
    '',
    { t: 'n', f: `SUM(D${startRow}:D${endRow})`, v: holdings.reduce((s, x) => s + x.qty, 0) },
    { t: 'n', f: `SUM(E${startRow}:E${endRow})`, v: holdings.reduce((s, x) => s + x.lots, 0) },
    '',
    // Total Investment
    { t: 'n', f: `SUM(G${startRow}:G${endRow})`, v: Number(totals.totalInvestment.toFixed(2)) },
    '',
    // Total Current Value
    { t: 'n', f: `SUM(I${startRow}:I${endRow})`, v: Number(totals.totalCurrentValue.toFixed(2)) },
    '',
    // Overall Return %
    { t: 'n', f: `IF(G${totalRowIndex}>0, Q${totalRowIndex}/G${totalRowIndex}, 0)`, v: Number((totals.totalUnrealizedPlPercent / 100).toFixed(4)) },
    '',
    '',
    '',
    '',
    '',
    // Total P/L
    { t: 'n', f: `SUM(Q${startRow}:Q${endRow})`, v: Number(totals.totalUnrealizedPl.toFixed(2)) },
    // Total Weight = SUM(R4:R14) = 1.00 (100%)
    { t: 'n', f: `SUM(R${startRow}:R${endRow})`, v: 1.0 },
  ]);

  // Add Advanced Analytical Formulas block below totals
  holdingsSheetData.push([]);
  holdingsSheetData.push(['ADVANCED PORTFOLIO METRICS & FORMULAS']);
  holdingsSheetData.push([
    'Metric Description',
    'Excel Formula Used',
    'Evaluated Value',
  ]);
  holdingsSheetData.push([
    'Top Performing Stock (Symbol)',
    `=INDEX(B${startRow}:B${endRow}, MATCH(MAX(Q${startRow}:Q${endRow}), Q${startRow}:Q${endRow}, 0))`,
    { t: 's', f: `INDEX(B${startRow}:B${endRow}, MATCH(MAX(Q${startRow}:Q${endRow}), Q${startRow}:Q${endRow}, 0))`, v: [...holdings].sort((a, b) => b.pl - a.pl)[0]?.symbol || '' },
  ]);
  holdingsSheetData.push([
    'Max Unrealized Profit (Rs)',
    `=MAX(Q${startRow}:Q${endRow})`,
    { t: 'n', f: `MAX(Q${startRow}:Q${endRow})`, v: Math.max(...holdings.map(h => h.pl)) },
  ]);
  holdingsSheetData.push([
    'Max Unrealized Loss (Rs)',
    `=MIN(Q${startRow}:Q${endRow})`,
    { t: 'n', f: `MIN(Q${startRow}:Q${endRow})`, v: Math.min(...holdings.map(h => h.pl)) },
  ]);
  holdingsSheetData.push([
    'Average Holding Investment',
    `=AVERAGE(G${startRow}:G${endRow})`,
    { t: 'n', f: `AVERAGE(G${startRow}:G${endRow})`, v: Number((totals.totalInvestment / (holdings.length || 1)).toFixed(2)) },
  ]);
  holdingsSheetData.push([
    'Positions in Profit Count',
    `=COUNTIF(Q${startRow}:Q${endRow}, ">0")`,
    { t: 'n', f: `COUNTIF(Q${startRow}:Q${endRow}, ">0")`, v: holdings.filter(h => h.pl > 0).length },
  ]);
  holdingsSheetData.push([
    'Positions in Loss Count',
    `=COUNTIF(Q${startRow}:Q${endRow}, "<0")`,
    { t: 'n', f: `COUNTIF(Q${startRow}:Q${endRow}, "<0")`, v: holdings.filter(h => h.pl < 0).length },
  ]);
  holdingsSheetData.push([
    'Win / Loss Ratio',
    `=COUNTIF(Q${startRow}:Q${endRow}, ">0")/MAX(1, COUNTIF(Q${startRow}:Q${endRow}, "<0"))`,
    { t: 'n', f: `COUNTIF(Q${startRow}:Q${endRow}, ">0")/MAX(1, COUNTIF(Q${startRow}:Q${endRow}, "<0"))`, v: Number((holdings.filter(h => h.pl > 0).length / Math.max(1, holdings.filter(h => h.pl < 0).length)).toFixed(2)) },
  ]);

  const wsHoldings = XLSX.utils.aoa_to_sheet(holdingsSheetData);
  // Column widths
  wsHoldings['!cols'] = [
    { wch: 8 },  // MKT
    { wch: 12 }, // SYMBOL
    { wch: 32 }, // SECTOR
    { wch: 10 }, // QTY
    { wch: 8 },  // LOTS
    { wch: 14 }, // AVG PRICE
    { wch: 16 }, // INVESTMENT
    { wch: 14 }, // CURRENT PRICE
    { wch: 16 }, // CURRENT VALUE
    { wch: 14 }, // CHANGE
    { wch: 12 }, // % CHANGE
    { wch: 10 }, // SIGNAL
    { wch: 12 }, // VOLUME
    { wch: 12 }, // LOW
    { wch: 12 }, // AVG
    { wch: 12 }, // HIGH
    { wch: 14 }, // P/L
    { wch: 16 }, // WEIGHT
  ];
  XLSX.utils.book_append_sheet(wb, wsHoldings, 'Holdings_Portfolio');

  // ==========================================
  // SHEET 2: TRADE LOG & LEDGER WITH FORMULAS
  // ==========================================
  const tradesSheetData: Array<Array<string | number | { t: string; f?: string; v?: string | number }>> = [
    ['PORTFOLIO TRADE LOG (BUY & SELL ORDERS)'],
    ['Brokerage Commission Model: 0.15% on Gross Execution Value', '', '', '', '', '', '', '', ''],
    [
      'TRADE ID',
      'DATE',
      'TIME',
      'SYMBOL',
      'ACTION',
      'LOTS',
      'QTY (SHARES)',
      'EXEC PRICE',
      'GROSS VALUE',
      'COMMISSION (0.15%)',
      'NET CASH FLOW',
      'REALIZED P/L',
      'NOTES',
    ],
  ];

  const tradeStartRow = 4;
  trades.forEach((t, i) => {
    const r = tradeStartRow + i;
    tradesSheetData.push([
      t.id,
      t.date,
      t.time,
      t.symbol,
      t.type,
      t.lots,
      t.qty, // Col G
      t.price, // Col H
      // GROSS VALUE = QTY * PRICE -> =G{r}*H{r}
      { t: 'n', f: `G${r}*H${r}`, v: Number((t.qty * t.price).toFixed(2)) }, // Col I
      // COMMISSION = ROUND(GROSS * 0.0015, 2) -> =ROUND(I{r}*0.0015, 2)
      { t: 'n', f: `ROUND(I${r}*0.0015, 2)`, v: Number(t.commission.toFixed(2)) }, // Col J
      // NET CASH FLOW: IF BUY -> -(GROSS + COMM), IF SELL -> (GROSS - COMM)
      { t: 'n', f: `IF(E${r}="BUY", -(I${r}+J${r}), (I${r}-J${r}))`, v: Number(t.netCashFlow.toFixed(2)) }, // Col K
      // REALIZED P/L
      t.type === 'SELL' && t.realizedPl !== undefined
        ? { t: 'n', f: `IF(E${r}="SELL", (H${r}-IFERROR(VLOOKUP(D${r}, Holdings_Portfolio!$B$4:$F$50, 5, FALSE), H${r}))*G${r}-J${r}, 0)`, v: Number(t.realizedPl.toFixed(2)) }
        : 0,
      t.notes || '',
    ]);
  });

  const tradeEndRow = tradeStartRow + trades.length - 1;
  const tradeTotalRow = tradeEndRow + 1;
  tradesSheetData.push([
    'TOTALS',
    '',
    '',
    '',
    '',
    { t: 'n', f: `SUM(F${tradeStartRow}:F${tradeEndRow})`, v: trades.reduce((s, t) => s + t.lots, 0) },
    { t: 'n', f: `SUM(G${tradeStartRow}:G${tradeEndRow})`, v: trades.reduce((s, t) => s + t.qty, 0) },
    '',
    { t: 'n', f: `SUM(I${tradeStartRow}:I${tradeEndRow})`, v: trades.reduce((s, t) => s + t.grossAmount, 0) },
    { t: 'n', f: `SUM(J${tradeStartRow}:J${tradeEndRow})`, v: trades.reduce((s, t) => s + t.commission, 0) },
    { t: 'n', f: `SUM(K${tradeStartRow}:K${tradeEndRow})`, v: trades.reduce((s, t) => s + t.netCashFlow, 0) },
    { t: 'n', f: `SUM(L${tradeStartRow}:L${tradeEndRow})`, v: trades.reduce((s, t) => s + (t.realizedPl || 0), 0) },
    '',
  ]);

  const wsTrades = XLSX.utils.aoa_to_sheet(tradesSheetData);
  wsTrades['!cols'] = [
    { wch: 14 }, // ID
    { wch: 12 }, // DATE
    { wch: 10 }, // TIME
    { wch: 12 }, // SYMBOL
    { wch: 10 }, // ACTION
    { wch: 8 },  // LOTS
    { wch: 14 }, // QTY
    { wch: 14 }, // EXEC PRICE
    { wch: 16 }, // GROSS VALUE
    { wch: 18 }, // COMMISSION
    { wch: 18 }, // NET CASH FLOW
    { wch: 16 }, // REALIZED P/L
    { wch: 30 }, // NOTES
  ];
  XLSX.utils.book_append_sheet(wb, wsTrades, 'Trade_Log_Ledger');

  // ==========================================
  // SHEET 3: WATCHLIST WITH FORMULAS
  // ==========================================
  const watchlistSheetData: Array<Array<string | number | { t: string; f?: string; v?: string | number }>> = [
    ['WATCHLIST & PRICE TRIGGER MODEL'],
    ['Tracking Key Candidates & Target Triggers', '', '', '', '', '', '', '', '', ''],
    [
      'SYMBOL',
      'COMPANY NAME',
      'SECTOR',
      'TARGET BUY PRICE',
      'CURRENT PRICE',
      'PREV CLOSE',
      'DAY CHANGE',
      '% CHANGE',
      'DAY LOW',
      'DAY HIGH',
      'TRIGGER STATUS FORMULA',
      'DISCOUNT TO TARGET %',
      'NOTES',
    ],
  ];

  const wlStartRow = 4;
  watchlist.forEach((w, i) => {
    const r = wlStartRow + i;
    watchlistSheetData.push([
      w.symbol,
      w.companyName,
      w.sector,
      w.targetBuyPrice, // Col D
      w.currentPrice,   // Col E
      w.prevClose,      // Col F
      { t: 'n', f: `E${r}-F${r}`, v: Number((w.currentPrice - w.prevClose).toFixed(2)) }, // Col G (Day Change)
      { t: 'n', f: `IF(F${r}>0, (E${r}-F${r})/F${r}, 0)`, v: Number(((w.currentPrice - w.prevClose) / w.prevClose).toFixed(4)) }, // Col H (% Change)
      w.dayLow,
      w.dayHigh,
      // TRIGGER STATUS: If current price <= target price then "BUY TARGET HIT", else "MONITORING"
      { t: 's', f: `IF(E${r}<=D${r}, "BUY TARGET HIT", IF(E${r}<=D${r}*1.03, "NEAR BUY ZONE", "MONITORING"))`, v: w.currentPrice <= w.targetBuyPrice ? 'BUY TARGET HIT' : 'MONITORING' },
      // DISCOUNT TO TARGET %: =(E{r}-D{r})/D{r}
      { t: 'n', f: `(E${r}-D${r})/D${r}`, v: Number(((w.currentPrice - w.targetBuyPrice) / w.targetBuyPrice).toFixed(4)) },
      w.notes || '',
    ]);
  });

  const wsWatchlist = XLSX.utils.aoa_to_sheet(watchlistSheetData);
  wsWatchlist['!cols'] = [
    { wch: 12 }, // SYMBOL
    { wch: 28 }, // NAME
    { wch: 28 }, // SECTOR
    { wch: 18 }, // TARGET BUY
    { wch: 16 }, // CURRENT PRICE
    { wch: 14 }, // PREV CLOSE
    { wch: 14 }, // CHANGE
    { wch: 12 }, // % CHG
    { wch: 12 }, // LOW
    { wch: 12 }, // HIGH
    { wch: 22 }, // STATUS
    { wch: 20 }, // DISCOUNT
    { wch: 32 }, // NOTES
  ];
  XLSX.utils.book_append_sheet(wb, wsWatchlist, 'Watchlist');

  // ==========================================
  // SHEET 4: ACCOUNT STATEMENT & CASH LEDGER
  // ==========================================
  const statementSheetData: Array<Array<string | number | { t: string; f?: string; v?: string | number }>> = [
    ['ACCOUNT STATEMENT & AUDITED CASH LEDGER'],
    ['Account ID: PK-SEC-8849201', 'Currency: PKR / Rupee', '', '', '', '', '', ''],
    [
      'STMT ID',
      'DATE',
      'TIME',
      'TRANSACTION TYPE',
      'REFERENCE',
      'DESCRIPTION',
      'DEBIT (OUTFLOW)',
      'CREDIT (INFLOW)',
      'FEE / TAX',
      'NET CASH FLOW',
      'RUNNING CASH BALANCE',
    ],
  ];

  const stmtStartRow = 4;
  statements.forEach((s, i) => {
    const r = stmtStartRow + i;
    statementSheetData.push([
      s.id,
      s.date,
      s.time,
      s.type,
      s.reference,
      s.description,
      s.debit,  // Col G
      s.credit, // Col H
      s.fee,    // Col I
      // Net = Credit - Debit
      { t: 'n', f: `H${r}-G${r}`, v: Number(s.netAmount.toFixed(2)) }, // Col J
      // Running Balance formula: first row = J4, subsequent rows = K{r-1}+J{r}
      i === 0
        ? { t: 'n', f: `J${r}`, v: Number(s.runningBalance.toFixed(2)) }
        : { t: 'n', f: `K${r - 1}+J${r}`, v: Number(s.runningBalance.toFixed(2)) }, // Col K
    ]);
  });

  const stmtEndRow = stmtStartRow + statements.length - 1;
  const stmtTotalRow = stmtEndRow + 1;
  statementSheetData.push([
    'TOTALS / CLOSING BALANCE',
    '',
    '',
    '',
    '',
    '',
    { t: 'n', f: `SUM(G${stmtStartRow}:G${stmtEndRow})`, v: statements.reduce((s, x) => s + x.debit, 0) },
    { t: 'n', f: `SUM(H${stmtStartRow}:H${stmtEndRow})`, v: statements.reduce((s, x) => s + x.credit, 0) },
    { t: 'n', f: `SUM(I${stmtStartRow}:I${stmtEndRow})`, v: statements.reduce((s, x) => s + x.fee, 0) },
    { t: 'n', f: `SUM(J${stmtStartRow}:J${stmtEndRow})`, v: statements.reduce((s, x) => s + x.netAmount, 0) },
    // Closing cash = last row balance
    { t: 'n', f: `K${stmtEndRow}`, v: Number(totals.cashBalance.toFixed(2)) },
  ]);

  // Executive Balance Sheet Summary at the bottom of Account Statement
  statementSheetData.push([]);
  statementSheetData.push(['EXECUTIVE EQUITY STATEMENT & RECONCILIATION']);
  statementSheetData.push([
    'Ledger Item',
    'Formula / Source',
    'Amount (PKR)',
  ]);
  statementSheetData.push([
    'Available Liquid Cash',
    `=K${stmtEndRow}`,
    { t: 'n', f: `K${stmtEndRow}`, v: Number(totals.cashBalance.toFixed(2)) },
  ]);
  statementSheetData.push([
    'Stock Portfolio Market Value',
    `=Holdings_Portfolio!I${totalRowIndex}`,
    { t: 'n', f: `Holdings_Portfolio!I${totalRowIndex}`, v: Number(totals.totalCurrentValue.toFixed(2)) },
  ]);
  statementSheetData.push([
    'TOTAL ACCOUNT EQUITY (NAV)',
    `=B${stmtTotalRow + 4}+B${stmtTotalRow + 5}`,
    { t: 'n', f: `C${stmtTotalRow + 4}+C${stmtTotalRow + 5}`, v: Number(totals.totalEquity.toFixed(2)) },
  ]);
  statementSheetData.push([
    'Total Realized Trading Profit',
    `=Trade_Log_Ledger!L${tradeTotalRow}`,
    { t: 'n', f: `Trade_Log_Ledger!L${tradeTotalRow}`, v: Number(totals.totalRealizedPl.toFixed(2)) },
  ]);
  statementSheetData.push([
    'Total Unrealized Stock P/L',
    `=Holdings_Portfolio!Q${totalRowIndex}`,
    { t: 'n', f: `Holdings_Portfolio!Q${totalRowIndex}`, v: Number(totals.totalUnrealizedPl.toFixed(2)) },
  ]);

  const wsStatements = XLSX.utils.aoa_to_sheet(statementSheetData);
  wsStatements['!cols'] = [
    { wch: 14 }, // ID
    { wch: 12 }, // DATE
    { wch: 10 }, // TIME
    { wch: 18 }, // TYPE
    { wch: 18 }, // REF
    { wch: 38 }, // DESC
    { wch: 16 }, // DEBIT
    { wch: 16 }, // CREDIT
    { wch: 14 }, // FEE
    { wch: 16 }, // NET
    { wch: 22 }, // RUNNING BAL
  ];
  XLSX.utils.book_append_sheet(wb, wsStatements, 'Account_Statement');

  // ==========================================
  // SHEET 5: ADVANCED EXCEL FORMULA GUIDE
  // ==========================================
  const guideSheetData = [
    ['ADVANCED EXCEL FORMULAS MASTER REFERENCE GUIDE'],
    ['This workbook contains dynamic formulas linking portfolios, trades, and cash ledgers.'],
    [],
    ['FUNCTION', 'PURPOSE IN THIS MODEL', 'EXCEL FORMULA TEMPLATE', 'EXPLANATION'],
    [
      'INDEX & MATCH',
      'Dynamic lookup of highest yielding stock',
      '=INDEX(B4:B14, MATCH(MAX(Q4:Q14), Q4:Q14, 0))',
      'Searches column Q for the maximum profit and retrieves the corresponding stock symbol from column B.',
    ],
    [
      'XLOOKUP / VLOOKUP',
      'Cross-sheet cost-basis retrieval on trade execution',
      '=VLOOKUP(D4, Holdings_Portfolio!$B$4:$F$50, 5, FALSE)',
      'Finds the average purchase price of a sold stock from the Holdings sheet to calculate realized gains on sell orders.',
    ],
    [
      'SUMIF',
      'Sector-wise capital allocation & Trade volume aggregates',
      '=SUMIF(C4:C14, "FERTILIZER", I4:I14)',
      'Aggregates market value strictly for stocks belonging to the specified industry sector.',
    ],
    [
      'COUNTIF',
      'Win/Loss trade performance analytics',
      '=COUNTIF(Q4:Q14, ">0") / MAX(1, COUNTIF(Q4:Q14, "<0"))',
      'Computes the ratio of profitable stock positions versus losing stock positions.',
    ],
    [
      'DYNAMIC WEIGHTS',
      'Portfolio allocation percentage calculation',
      '=I4 / $I$15',
      'Divides individual holding value by absolute fixed reference of total portfolio value ($I$15).',
    ],
    [
      'CASH RUNNING BALANCE',
      'Real-time cumulative ledger reconciliation',
      '=K3 + J4',
      'Adds current row net cashflow (credits minus debits) to prior row balance for continuous reconciliation.',
    ],
    [
      'CONDITIONAL LOGIC',
      'Watchlist Target Buy Signal Trigger',
      '=IF(E4<=D4, "BUY TARGET HIT", IF(E4<=D4*1.03, "NEAR BUY ZONE", "MONITORING"))',
      'Automatically flags when current market price dips below or within 3% of investor target buy price.',
    ],
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(guideSheetData);
  wsGuide['!cols'] = [
    { wch: 22 },
    { wch: 32 },
    { wch: 42 },
    { wch: 54 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Excel_Formula_Guide');

  // Trigger download in browser
  const filename = `Stock_Portfolio_Model_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
