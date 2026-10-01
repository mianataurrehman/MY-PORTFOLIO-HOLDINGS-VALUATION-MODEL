import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { StockHolding } from '../types/stock';
import { LayoutGrid, ZoomIn, ArrowUpRight, ArrowDownRight, Layers, SlidersHorizontal } from 'lucide-react';

interface PortfolioHeatmapProps {
  holdings: StockHolding[];
  onSelectStock?: (holding: StockHolding) => void;
  onBuyClick?: (symbol: string) => void;
}

interface TreemapLeafData {
  name: string;
  holding?: StockHolding;
  value?: number;
  changePercent?: number;
  sector?: string;
  children?: TreemapLeafData[];
}

export const PortfolioHeatmap: React.FC<PortfolioHeatmapProps> = ({
  holdings,
  onSelectStock,
  onBuyClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 420 });
  const [colorMode, setColorMode] = useState<'dayChange' | 'totalPl'>('dayChange');
  const [groupBySector, setGroupBySector] = useState(true);
  const [hoveredHolding, setHoveredHolding] = useState<StockHolding | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update dimensions on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        // Height proportional to width, min 380px, max 480px
        const dynamicHeight = Math.max(360, Math.min(480, Math.round(width * 0.42)));
        setDimensions({ width, height: dynamicHeight });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Total portfolio value for percentage calculation
  const totalMarketValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.currentValue, 0);
  }, [holdings]);

  // Color generator
  const getColor = (pct: number) => {
    if (pct > 3.0) return '#15803d'; // strong green
    if (pct > 1.5) return '#16a34a';
    if (pct > 0.3) return '#22c55e';
    if (pct >= -0.3) return '#2e3138'; // neutral near-flat
    if (pct >= -1.5) return '#ef4444';
    if (pct >= -3.0) return '#dc2626';
    return '#991b1b'; // deep crimson
  };

  // Render D3 Treemap
  useEffect(() => {
    if (!svgRef.current || holdings.length === 0 || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Prepare hierarchical data
    let rootData: TreemapLeafData;

    if (groupBySector) {
      const sectorsMap = new Map<string, StockHolding[]>();
      holdings.forEach((h) => {
        const sector = h.sector || 'OTHER';
        if (!sectorsMap.has(sector)) {
          sectorsMap.set(sector, []);
        }
        sectorsMap.get(sector)!.push(h);
      });

      const children: TreemapLeafData[] = Array.from(sectorsMap.entries()).map(([sector, items]) => ({
        name: sector,
        children: items.map((h) => ({
          name: h.symbol,
          holding: h,
          value: Math.max(1, h.currentValue),
          changePercent: colorMode === 'dayChange' ? h.changePercent : (h.investment > 0 ? (h.pl / h.investment) * 100 : 0),
          sector: h.sector,
        })),
      }));

      rootData = {
        name: 'Portfolio',
        children,
      };
    } else {
      rootData = {
        name: 'Portfolio',
        children: holdings.map((h) => ({
          name: h.symbol,
          holding: h,
          value: Math.max(1, h.currentValue),
          changePercent: colorMode === 'dayChange' ? h.changePercent : (h.investment > 0 ? (h.pl / h.investment) * 100 : 0),
          sector: h.sector,
        })),
      };
    }

    // Build D3 hierarchy
    const root = d3
      .hierarchy<TreemapLeafData>(rootData)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Treemap layout
    const treemap = d3
      .treemap<TreemapLeafData>()
      .size([width, height])
      .paddingTop(groupBySector ? 20 : 2)
      .paddingRight(2)
      .paddingBottom(2)
      .paddingLeft(2)
      .paddingInner(2)
      .round(true);

    treemap(root);

    // If grouping by sector, render sector boundary containers and titles
    if (groupBySector && root.children) {
      const sectorGroups = svg
        .selectAll('.sector-group')
        .data(root.children)
        .enter()
        .append('g')
        .attr('class', 'sector-group');

      // Sector header background
      sectorGroups
        .append('rect')
        .attr('x', (d: any) => d.x0)
        .attr('y', (d: any) => d.y0)
        .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
        .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
        .attr('fill', '#141518')
        .attr('stroke', '#272a30')
        .attr('stroke-width', 1)
        .attr('rx', 3);

      // Sector title label
      sectorGroups
        .append('text')
        .attr('x', (d: any) => d.x0 + 6)
        .attr('y', (d: any) => d.y0 + 13)
        .attr('fill', '#9ca3af')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '700')
        .attr('letter-spacing', '0.05em')
        .text((d: any) => {
          const w = d.x1 - d.x0;
          if (w < 60) return '';
          const name = d.data.name;
          return w < 120 && name.length > 12 ? name.substring(0, 10) + '..' : name;
        });
    }

    // Leaf nodes (individual stocks)
    const leaves = root.leaves();

    const cell = svg
      .selectAll('.cell')
      .data(leaves)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer');

    // Box rectangle
    cell
      .append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => getColor(d.data.changePercent || 0))
      .attr('rx', 3)
      .attr('stroke', '#121316')
      .attr('stroke-width', 1.5)
      .style('transition', 'filter 0.15s ease')
      .on('mouseenter', function (event, d: any) {
        d3.select(this).attr('filter', 'brightness(1.25)');
        if (d.data.holding) {
          setHoveredHolding(d.data.holding);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
        }
      })
      .on('mousemove', (event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }
      })
      .on('mouseleave', function () {
        d3.select(this).attr('filter', 'none');
        setHoveredHolding(null);
      })
      .on('click', (_, d: any) => {
        if (d.data.holding && onSelectStock) {
          onSelectStock(d.data.holding);
        }
      });

    // Content container inside each cell
    cell.each(function (d: any) {
      const boxWidth = d.x1 - d.x0;
      const boxHeight = d.y1 - d.y0;
      const node = d3.select(this);

      // Only draw text if box is large enough
      if (boxWidth < 34 || boxHeight < 24) return;

      const g = node.append('g').attr('pointer-events', 'none');

      const symbol = d.data.name;
      const pctVal = d.data.changePercent || 0;
      const pctText = (pctVal > 0 ? `+${pctVal.toFixed(2)}` : pctVal.toFixed(2)) + '%';
      const holding = d.data.holding;
      const valText = holding ? (holding.currentValue >= 1000 ? `${(holding.currentValue / 1000).toFixed(1)}k` : `${holding.currentValue.toFixed(0)}`) : '';

      if (boxWidth >= 70 && boxHeight >= 55) {
        // Full label: Symbol + Change % + Value
        g.append('text')
          .attr('x', boxWidth / 2)
          .attr('y', boxHeight / 2 - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', boxWidth > 110 ? '13px' : '11px')
          .attr('font-family', 'Plus Jakarta Sans, sans-serif')
          .attr('font-weight', '800')
          .text(symbol);

        g.append('text')
          .attr('x', boxWidth / 2)
          .attr('y', boxHeight / 2 + 6)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', boxWidth > 110 ? '11px' : '10px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-weight', '700')
          .text(pctText);

        g.append('text')
          .attr('x', boxWidth / 2)
          .attr('y', boxHeight / 2 + 20)
          .attr('text-anchor', 'middle')
          .attr('fill', 'rgba(255, 255, 255, 0.75)')
          .attr('font-size', '9px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text(valText ? `${valText} PKR` : '');
      } else if (boxWidth >= 48 && boxHeight >= 36) {
        // Compact label: Symbol + Change %
        g.append('text')
          .attr('x', boxWidth / 2)
          .attr('y', boxHeight / 2 - 3)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '10px')
          .attr('font-family', 'Plus Jakarta Sans, sans-serif')
          .attr('font-weight', '800')
          .text(symbol);

        g.append('text')
          .attr('x', boxWidth / 2)
          .attr('y', boxHeight / 2 + 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '9px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-weight', '600')
          .text(pctText);
      } else {
        // Minimal: Symbol only
        g.append('text')
          .attr('x', boxWidth / 2)
          .attr('y', boxHeight / 2 + 3)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '9px')
          .attr('font-family', 'Plus Jakarta Sans, sans-serif')
          .attr('font-weight', '700')
          .text(symbol);
      }
    });
  }, [holdings, dimensions, colorMode, groupBySector, onSelectStock]);

  return (
    <div className="bg-[#18191d] border border-neutral-800 rounded-lg shadow-xl overflow-hidden flex flex-col font-mono">
      {/* Title & Controls Bar */}
      <div className="px-4 py-3 bg-[#18191d] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-neutral-200 uppercase">
            PORTFOLIO TREEMAP HEATMAP
          </h2>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            (Box Area: Market Value · Color: {colorMode === 'dayChange' ? 'Day Change %' : 'Total Return %'})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Group by Sector toggle */}
          <button
            onClick={() => setGroupBySector(!groupBySector)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
              groupBySector
                ? 'bg-neutral-700 text-white border border-neutral-600'
                : 'bg-[#141518] text-neutral-400 border border-neutral-800 hover:text-neutral-200'
            }`}
            title="Group stocks by industry sector or display unified layout"
          >
            <Layers className="w-3 h-3" />
            <span>{groupBySector ? 'Sector Grouped' : 'Flat Layout'}</span>
          </button>

          {/* Metric Selector */}
          <div className="flex items-center bg-[#121316] rounded border border-neutral-800 p-0.5">
            <button
              onClick={() => setColorMode('dayChange')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                colorMode === 'dayChange'
                  ? 'bg-emerald-800 text-emerald-200'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Day %
            </button>
            <button
              onClick={() => setColorMode('totalPl')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                colorMode === 'totalPl'
                  ? 'bg-emerald-800 text-emerald-200'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Total ROI %
            </button>
          </div>
        </div>
      </div>

      {/* Treemap SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full bg-[#121316] p-2 overflow-hidden select-none">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full block rounded overflow-hidden"
        />

        {/* Hover Tooltip Overlay */}
        {hoveredHolding && (
          <div
            className="absolute z-20 pointer-events-none bg-[#1e2025]/95 backdrop-blur-sm border border-neutral-700 rounded-lg p-3 text-xs shadow-2xl transition-all duration-75 text-neutral-200 min-w-[210px]"
            style={{
              left: `${Math.min(dimensions.width - 230, Math.max(10, tooltipPos.x + 15))}px`,
              top: `${Math.min(dimensions.height - 150, Math.max(10, tooltipPos.y + 15))}px`,
            }}
          >
            <div className="flex items-center justify-between border-b border-neutral-700/80 pb-1.5 mb-1.5">
              <span className="font-extrabold text-sm text-neutral-100 font-sans">{hoveredHolding.symbol}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#221f15] text-[#d4af37] border border-[#725e21]">
                {hoveredHolding.mkt}
              </span>
            </div>

            <div className="text-[10px] text-neutral-400 truncate mb-2">{hoveredHolding.sector}</div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-400">Current Value:</span>
                <span className="font-bold text-neutral-100">
                  {hoveredHolding.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} PKR
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Portfolio Weight:</span>
                <span className="font-bold text-neutral-200">{hoveredHolding.weight.toFixed(2)}%</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Current Price:</span>
                <span className="font-medium text-neutral-200">{hoveredHolding.currentPrice.toFixed(2)} PKR</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Day Change:</span>
                <span className={`font-bold ${hoveredHolding.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hoveredHolding.change >= 0 ? `+${hoveredHolding.change.toFixed(2)}` : hoveredHolding.change.toFixed(2)} ({hoveredHolding.changePercent > 0 ? '+' : ''}{hoveredHolding.changePercent.toFixed(2)}%)
                </span>
              </div>

              <div className="flex justify-between pt-1 border-t border-neutral-700/60">
                <span className="text-neutral-400">Total P/L:</span>
                <span className={`font-bold ${hoveredHolding.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hoveredHolding.pl >= 0 ? `+${hoveredHolding.pl.toFixed(2)}` : hoveredHolding.pl.toFixed(2)} PKR
                </span>
              </div>
            </div>

            <div className="mt-2 pt-1 text-[10px] text-neutral-400 text-center border-t border-neutral-800">
              Click box to inspect stock
            </div>
          </div>
        )}
      </div>

      {/* Heatmap Legend Bar */}
      <div className="px-4 py-2 bg-[#151619] border-t border-neutral-800 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">Performance Scale:</span>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#991b1b] text-white">&le; -3%</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#dc2626] text-white">-2%</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ef4444] text-white">-1%</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2e3138] text-neutral-300">0%</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#22c55e] text-black">+1%</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#16a34a] text-white">+2%</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#15803d] text-white">&ge; +3%</span>
          </div>
        </div>

        <div className="text-[11px] text-neutral-400">
          Showing {holdings.length} Positions · Total Market Cap: {totalMarketValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} PKR
        </div>
      </div>
    </div>
  );
};
