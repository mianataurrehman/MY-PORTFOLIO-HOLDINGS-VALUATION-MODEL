export interface StockHolding {
  id: string;
  mkt: string; // 'REG'
  symbol: string;
  sector: string;
  qty: number;
  lots: number;
  avgPrice: number;
  investment: number;
  currentPrice: number;
  currentValue: number;
  change: number;
  changePercent: number;
  tradeSignal: 'WATCH' | 'HOLD' | 'BUY';
  volume: string;
  low: number;
  average: number;
  high: number;
  pl: number;
  weight: number;
  priceFlash?: 'up' | 'down' | null;
}

export type TradeType = 'BUY' | 'SELL';

export interface TradeRecord {
  id: string;
  date: string;
  time: string;
  symbol: string;
  type: TradeType;
  lots: number;
  qty: number;
  price: number;
  grossAmount: number;
  commission: number;
  netCashFlow: number; // negative for BUY (cash spent), positive for SELL (cash received)
  realizedPl?: number; // only applicable for SELL
  notes?: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  prevClose: number;
  change: number;
  changePercent: number;
  dayLow: number;
  dayHigh: number;
  volume: string;
  targetBuyPrice: number;
  status: 'WATCH' | 'HOLD' | 'BUY' | 'STRONG BUY';
  notes?: string;
}

export type StatementType = 'INITIAL DEPOSIT' | 'BUY ORDER' | 'SELL ORDER' | 'DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND' | 'BROKERAGE FEE';

export interface StatementEntry {
  id: string;
  date: string;
  time: string;
  type: StatementType;
  reference: string;
  description: string;
  debit: number; // money deducted
  credit: number; // money added
  fee: number;
  netAmount: number;
  runningBalance: number;
}

export interface PortfolioTotals {
  totalInvestment: number;
  totalCurrentValue: number;
  totalUnrealizedPl: number;
  totalUnrealizedPlPercent: number;
  todayChange: number;
  todayChangePercent: number;
  cashBalance: number;
  totalEquity: number;
  totalRealizedPl: number;
  totalTradesCount: number;
}
