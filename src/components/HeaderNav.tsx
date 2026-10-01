import React from 'react';
import { Download, Plus, Play, Pause, FileSpreadsheet } from 'lucide-react';

export type MainTab = 'holdings' | 'watchlist' | 'statement' | 'trades' | 'excel';

interface HeaderNavProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenTradeModal: () => void;
  onExportExcel: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onTabChange,
  onOpenTradeModal,
  onExportExcel,
  isSimulating,
  onToggleSimulation,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#141518]/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-base font-extrabold tracking-tight text-neutral-100 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
            PROTRADE
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-1.5 py-0.5 rounded">
            EXCEL MODEL v3
          </span>
        </div>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => onTabChange('holdings')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              currentTab === 'holdings'
                ? 'bg-[#23262d] text-emerald-400 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
            }`}
          >
            Holdings Portfolio
          </button>

          <button
            onClick={() => onTabChange('watchlist')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              currentTab === 'watchlist'
                ? 'bg-[#23262d] text-emerald-400 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
            }`}
          >
            Live Watchlist
          </button>

          <button
            onClick={() => onTabChange('statement')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              currentTab === 'statement'
                ? 'bg-[#23262d] text-emerald-400 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
            }`}
          >
            Account Statement
          </button>

          <button
            onClick={() => onTabChange('trades')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              currentTab === 'trades'
                ? 'bg-[#23262d] text-emerald-400 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
            }`}
          >
            Trade Log
          </button>

          <button
            onClick={() => onTabChange('excel')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'excel'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1b1f]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel Formula Engine</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0 font-mono">
          {/* Live Simulator Toggle */}
          <button
            onClick={onToggleSimulation}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors border ${
              isSimulating
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                : 'bg-[#1a1b1f] text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
            title="Toggle simulated live market price fluctuations"
          >
            {isSimulating ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Market: Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-neutral-600" />
                <span>Market: Paused</span>
              </>
            )}
          </button>

          {/* Export Excel Button */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
            title="Download multi-sheet Excel file with live formulas"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .XLSX</span>
            <span className="sm:hidden">.XLSX</span>
          </button>

          {/* + New Trade Button */}
          <button
            onClick={onOpenTradeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Trade</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-1.5 border-t border-neutral-800 overflow-x-auto font-mono text-xs bg-[#121316]">
        <button
          onClick={() => onTabChange('holdings')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
            currentTab === 'holdings' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400'
          }`}
        >
          Holdings
        </button>
        <button
          onClick={() => onTabChange('watchlist')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
            currentTab === 'watchlist' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400'
          }`}
        >
          Watchlist
        </button>
        <button
          onClick={() => onTabChange('statement')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
            currentTab === 'statement' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400'
          }`}
        >
          Statement
        </button>
        <button
          onClick={() => onTabChange('trades')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
            currentTab === 'trades' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400'
          }`}
        >
          Trade Log
        </button>
        <button
          onClick={() => onTabChange('excel')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap text-emerald-400 ${
            currentTab === 'excel' ? 'bg-emerald-950 text-emerald-300' : ''
          }`}
        >
          Excel Model
        </button>
      </div>
    </header>
  );
};
