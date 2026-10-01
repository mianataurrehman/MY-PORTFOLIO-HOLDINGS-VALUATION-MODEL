import React, { useState } from 'react';
import { StatementEntry, PortfolioTotals } from '../types/stock';
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, Minus, Download, Search, CheckCircle2, AlertCircle } from 'lucide-react';

interface AccountStatementViewProps {
  statements: StatementEntry[];
  totals: PortfolioTotals;
  onDepositFunds: (amount: number, description: string) => void;
  onWithdrawFunds: (amount: number, description: string) => boolean;
  onExportExcel: () => void;
}

export const AccountStatementView: React.FC<AccountStatementViewProps> = ({
  statements,
  totals,
  onDepositFunds,
  onWithdrawFunds,
  onExportExcel,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showFundModal, setShowFundModal] = useState<'DEPOSIT' | 'WITHDRAW' | null>(null);
  const [fundAmount, setFundAmount] = useState<number>(25000);
  const [fundDesc, setFundDesc] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const filteredStatements = statements.filter((s) => {
    const matchesType = filterType === 'ALL' || s.type === filterType;
    const matchesSearch =
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.reference.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalCredits = statements.reduce((acc, s) => acc + s.credit, 0);
  const totalDebits = statements.reduce((acc, s) => acc + s.debit, 0);
  const totalFees = statements.reduce((acc, s) => acc + s.fee, 0);

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (fundAmount <= 0) {
      setModalError('Amount must be greater than zero.');
      return;
    }

    if (showFundModal === 'DEPOSIT') {
      onDepositFunds(fundAmount, fundDesc.trim() || 'Electronic Bank Capital Transfer');
      setShowFundModal(null);
      setFundAmount(25000);
      setFundDesc('');
    } else if (showFundModal === 'WITHDRAW') {
      const success = onWithdrawFunds(fundAmount, fundDesc.trim() || 'Wire Transfer Withdrawal');
      if (success) {
        setShowFundModal(null);
        setFundAmount(25000);
        setFundDesc('');
      } else {
        setModalError(`Cannot withdraw ${fundAmount.toLocaleString()} PKR. Maximum available cash is ${totals.cashBalance.toLocaleString()} PKR.`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Account Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Available Cash */}
        <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Available Cash Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-emerald-400">
            {totals.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs text-neutral-400 font-normal">PKR</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">Ready for instant stock purchases</div>
        </div>

        {/* Portfolio Market Value */}
        <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Stock Portfolio Value</span>
            <span className="text-neutral-500 text-xs">11 Positions</span>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-neutral-100">
            {totals.totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs text-neutral-400 font-normal">PKR</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Cost: {totals.totalInvestment.toLocaleString('en-US', { maximumFractionDigits: 0 })} PKR
          </div>
        </div>

        {/* Total Equity / Net Asset Value */}
        <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Equity (NAV)</span>
            <span className="text-emerald-400 font-semibold text-xs">Cash + Stock</span>
          </div>
          <div className="mt-2 text-lg sm:text-xl font-bold text-neutral-100">
            {totals.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs text-neutral-400 font-normal">PKR</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">Reconciled in real time</div>
        </div>

        {/* Realized Profit */}
        <div className="bg-[#18191d] border border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Realized P/L</span>
            <span className="text-neutral-500 text-xs">Closed Trades</span>
          </div>
          <div className={`mt-2 text-lg sm:text-xl font-bold ${totals.totalRealizedPl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totals.totalRealizedPl >= 0 ? `+${totals.totalRealizedPl.toFixed(2)}` : totals.totalRealizedPl.toFixed(2)}{' '}
            <span className="text-xs text-neutral-400 font-normal">PKR</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">Total fees paid: {totalFees.toFixed(2)} PKR</div>
        </div>
      </div>

      {/* Main Statement Ledger Box */}
      <div className="bg-[#18191d] border border-neutral-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Statement Controls Bar */}
        <div className="px-4 py-3 bg-[#18191d] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">📑</span>
            <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-neutral-200 uppercase">
              AUDITED ACCOUNT STATEMENT & CASH LEDGER
            </h2>
            <span className="text-[11px] text-neutral-400 font-mono">({statements.length} Records)</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFundModal('DEPOSIT')}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit Cash</span>
            </button>

            <button
              onClick={() => setShowFundModal('WITHDRAW')}
              className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-semibold transition-colors border border-neutral-700"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded text-xs font-semibold transition-colors border border-neutral-700"
              title="Export statement as Excel file with formulas"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-4 py-2.5 bg-[#141518] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'BUY ORDER', 'SELL ORDER', 'INITIAL DEPOSIT', 'DEPOSIT', 'DIVIDEND'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                  filterType === type
                    ? 'bg-neutral-700 text-white font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search reference or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1a1b1f] border border-neutral-700 rounded px-2.5 py-1 pl-8 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 w-52"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-mono">
            <thead>
              <tr className="bg-[#151619] text-neutral-400 text-[11px] font-semibold border-b border-neutral-800 select-none">
                <th className="py-2.5 px-3 uppercase tracking-wider">STMT ID</th>
                <th className="py-2.5 px-3 uppercase tracking-wider">DATE & TIME</th>
                <th className="py-2.5 px-3 uppercase tracking-wider">TRANSACTION TYPE</th>
                <th className="py-2.5 px-3 uppercase tracking-wider">REFERENCE</th>
                <th className="py-2.5 px-3 uppercase tracking-wider">DESCRIPTION</th>
                <th className="py-2.5 px-3 uppercase tracking-wider text-right text-rose-400">DEBIT (OUTFLOW)</th>
                <th className="py-2.5 px-3 uppercase tracking-wider text-right text-emerald-400">CREDIT (INFLOW)</th>
                <th className="py-2.5 px-3 uppercase tracking-wider text-right text-neutral-400">BROKER FEE</th>
                <th className="py-2.5 px-3 uppercase tracking-wider text-right text-neutral-300">NET CASH FLOW</th>
                <th className="py-2.5 px-3 uppercase tracking-wider text-right text-amber-400 font-bold">RUNNING CASH BAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 bg-[#16171b]">
              {filteredStatements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-neutral-400">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredStatements.map((s) => {
                  const isCredit = s.credit > 0;
                  const isDebit = s.debit > 0;

                  return (
                    <tr key={s.id} className="hover:bg-[#1f2127] transition-colors">
                      <td className="py-2.5 px-3 text-neutral-400">{s.id}</td>
                      <td className="py-2.5 px-3 text-neutral-300">
                        <span>{s.date}</span>{' '}
                        <span className="text-neutral-500 text-[10px]">{s.time}</span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                            s.type === 'BUY ORDER'
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                              : s.type === 'SELL ORDER'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                              : s.type.includes('DEPOSIT')
                              ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                              : s.type === 'DIVIDEND'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          {s.type}
                        </span>
                      </td>

                      {/* Reference */}
                      <td className="py-2.5 px-3 font-semibold text-neutral-200">{s.reference}</td>

                      {/* Description */}
                      <td className="py-2.5 px-3 text-neutral-300 truncate max-w-[280px]" title={s.description}>
                        {s.description}
                      </td>

                      {/* Debit */}
                      <td className="py-2.5 px-3 text-right text-rose-400 font-medium">
                        {isDebit ? `- ${s.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                      </td>

                      {/* Credit */}
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">
                        {isCredit ? `+ ${s.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                      </td>

                      {/* Fee */}
                      <td className="py-2.5 px-3 text-right text-neutral-400">
                        {s.fee > 0 ? s.fee.toFixed(2) : '0.00'}
                      </td>

                      {/* Net */}
                      <td
                        className={`py-2.5 px-3 text-right font-medium ${
                          s.netAmount >= 0 ? 'text-emerald-400' : 'text-neutral-300'
                        }`}
                      >
                        {s.netAmount >= 0 ? `+${s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : s.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Running Balance */}
                      <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                        {s.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                        <span className="text-[10px] text-neutral-500 font-normal">PKR</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit / Withdraw Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#18191d] border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden font-mono">
            <div className="bg-[#1e2025] px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                {showFundModal === 'DEPOSIT' ? (
                  <>
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Deposit Funds to Trading Account</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4 text-rose-400" />
                    <span>Withdraw Cash to Bank</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowFundModal(null)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFundSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Amount in PKR
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  required
                  value={fundAmount}
                  onChange={(e) => setFundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#121316] border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Reference / Description
                </label>
                <input
                  type="text"
                  placeholder={showFundModal === 'DEPOSIT' ? 'e.g. Bank Raast Wire Transfer' : 'e.g. Profit Withdrawal to HBL'}
                  value={fundDesc}
                  onChange={(e) => setFundDesc(e.target.value)}
                  className="w-full bg-[#121316] border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-[#121316] rounded-lg border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Current Available Cash:</span>
                  <span className="text-neutral-200 font-bold">{totals.cashBalance.toLocaleString()} PKR</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected New Cash:</span>
                  <span className="text-emerald-400 font-bold">
                    {(showFundModal === 'DEPOSIT'
                      ? totals.cashBalance + fundAmount
                      : totals.cashBalance - fundAmount
                    ).toLocaleString()}{' '}
                    PKR
                  </span>
                </div>
              </div>

              {modalError && (
                <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFundModal(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg font-bold text-white shadow-md ${
                    showFundModal === 'DEPOSIT'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {showFundModal === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
