import React from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
} from "lightweight-charts";
import type {
  CandlestickData,
  IChartApi,
  IPriceLine,
  ISeriesApi,
  LineData,
  MouseEventParams,
  UTCTimestamp,
} from "lightweight-charts";
import type { CandleDto } from "../../../shared/api/types/backend";
import {
  bollingerLines,
  emaLine,
  rsiLine,
  smaLine,
  volumeHistogramData,
} from "../utils/chartIndicators";

const CHART_MIN_H = 340;
/** Limite l’écart entre barres : sans plafond, peu de bougies = corps très larges. */
const MAX_BAR_SPACING_PX = 14;
/** Plancher pour rester lisible quand il y a beaucoup de bougies (évite chevauchement excessif). */
const MIN_BAR_SPACING_PX = 2;
/** Part de la largeur du conteneur utilisée pour répartir les barres (marge pour échelle de prix). */
const TIME_SCALE_FILL_RATIO = 0.92;

function computeBarSpacingForFill(containerWidth: number, barCount: number): number {
  if (containerWidth <= 0 || barCount <= 0) return 6;
  const ideal = (containerWidth * TIME_SCALE_FILL_RATIO) / barCount;
  return Math.min(MAX_BAR_SPACING_PX, Math.max(MIN_BAR_SPACING_PX, ideal));
}
const RSI_PERIOD = 14;
const EMA_PERIOD = 12;
const BB_PERIOD = 20;
const BB_MULT = 2;

const BULL = "#22C55E";
const BEAR = "#F87171";
const SMA_COLOR = "#EAB308";
const EMA_COLOR = "#38BDF8";
const BB_UPPER = "rgba(148, 163, 184, 0.55)";
const BB_MID = "rgba(148, 163, 184, 0.35)";
const BB_LOWER = "rgba(148, 163, 184, 0.55)";
const RSI_COLOR = "#A78BFA";

export type ChartTradingOverlay = {
  averageEntryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
};

type SmaChoice = 0 | 9 | 20 | 50;

type Props = {
  candles: CandleDto[];
  /** Position ouverte simulée sur ce symbole (entrée, SL, TP). */
  tradingOverlay?: ChartTradingOverlay | null;
};

function formatPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (p >= 1) return p.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return p.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function mergeCandlesBySecond(sorted: CandleDto[]): CandleDto[] {
  const bySec = new Map<number, CandleDto>();
  for (const c of sorted) {
    const sec = Math.floor(c.timestamp / 1000);
    bySec.set(sec, c);
  }
  return [...bySec.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, c]) => c);
}

function candleDataFromMerged(merged: CandleDto[]): {
  candleData: CandlestickData[];
  closes: number[];
} {
  const candleData: CandlestickData[] = merged.map((c) => {
    const t = Math.floor(c.timestamp / 1000) as UTCTimestamp;
    return {
      time: t,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    };
  });
  const closes = candleData.map((d) => d.close);
  return { candleData, closes };
}

export function AssetCandleChart({ candles, tradingOverlay = null }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const candleSeriesRef = React.useRef<ISeriesApi<"Candlestick"> | null>(null);
  const smaSeriesRef = React.useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = React.useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperRef = React.useRef<ISeriesApi<"Line"> | null>(null);
  const bbMidRef = React.useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerRef = React.useRef<ISeriesApi<"Line"> | null>(null);
  const volSeriesRef = React.useRef<ISeriesApi<"Histogram"> | null>(null);
  const rsiSeriesRef = React.useRef<ISeriesApi<"Line"> | null>(null);
  const priceLineRefs = React.useRef<IPriceLine[]>([]);

  const [smaPeriod, setSmaPeriod] = React.useState<SmaChoice>(9);
  const [showRsi, setShowRsi] = React.useState(true);
  const [showEma, setShowEma] = React.useState(true);
  const [showBb, setShowBb] = React.useState(false);
  const [showVolume, setShowVolume] = React.useState(true);
  const [crosshairLegend, setCrosshairLegend] = React.useState<string | null>(null);

  const smaPeriodRef = React.useRef(smaPeriod);
  const showRsiRef = React.useRef(showRsi);
  const showEmaRef = React.useRef(showEma);
  const showBbRef = React.useRef(showBb);
  smaPeriodRef.current = smaPeriod;
  showRsiRef.current = showRsi;
  showEmaRef.current = showEma;
  showBbRef.current = showBb;

  const sorted = React.useMemo(() => [...candles].sort((a, b) => a.timestamp - b.timestamp), [candles]);
  const merged = React.useMemo(() => mergeCandlesBySecond(sorted), [sorted]);

  const { candleData, closes } = React.useMemo(() => candleDataFromMerged(merged), [merged]);

  const candleBarCountRef = React.useRef(0);
  candleBarCountRef.current = candleData.length;

  const smaData = React.useMemo(
    () => smaLine(candleData, closes, smaPeriod),
    [candleData, closes, smaPeriod],
  );
  const emaData = React.useMemo(() => emaLine(candleData, closes, EMA_PERIOD), [candleData, closes]);
  const bb = React.useMemo(() => bollingerLines(candleData, closes, BB_PERIOD, BB_MULT), [candleData, closes]);
  const rsiData = React.useMemo(() => rsiLine(candleData, closes, RSI_PERIOD), [candleData, closes]);
  const volData = React.useMemo(() => volumeHistogramData(candleData), [candleData]);

  const staticLegend = React.useMemo(() => {
    if (merged.length === 0) return null;
    const last = merged[merged.length - 1];
    const ohlc = `Dernière · O ${formatPrice(last.open)} · H ${formatPrice(last.high)} · L ${formatPrice(last.low)} · C ${formatPrice(last.close)}`;
    const lastSma = smaData.length > 0 ? smaData[smaData.length - 1].value : null;
    const smaLabel =
      smaPeriod > 0 && lastSma !== null && Number.isFinite(lastSma)
        ? `SMA${smaPeriod} ${formatPrice(lastSma)}`
        : null;
    const lastEma = emaData.length > 0 ? emaData[emaData.length - 1].value : null;
    const emaLabel =
      lastEma !== null && Number.isFinite(lastEma) ? `EMA${EMA_PERIOD} ${formatPrice(lastEma)}` : null;
    const lastRsi = rsiData.length > 0 ? rsiData[rsiData.length - 1].value : null;
    const rsiLabel =
      showRsi && lastRsi !== null && Number.isFinite(lastRsi) ? `RSI ${lastRsi.toFixed(1)}` : null;
    return { ohlc, sma: smaLabel, ema: emaLabel, rsi: rsiLabel };
  }, [merged, smaData, smaPeriod, emaData, rsiData, showRsi]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || merged.length === 0) {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
        smaSeriesRef.current = null;
        emaSeriesRef.current = null;
        bbUpperRef.current = null;
        bbMidRef.current = null;
        bbLowerRef.current = null;
        volSeriesRef.current = null;
        rsiSeriesRef.current = null;
        priceLineRefs.current = [];
      }
      return;
    }

    if (chartRef.current) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#0a0e14" },
        textColor: "rgba(230, 237, 243, 0.55)",
        fontSize: 11,
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(56, 189, 248, 0.35)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#1f2937",
        },
        horzLine: {
          color: "rgba(56, 189, 248, 0.35)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#1f2937",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        scaleMargins: { top: 0.06, bottom: 0.15 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 0,
        barSpacing: 6,
        maxBarSpacing: MAX_BAR_SPACING_PX,
        minBarSpacing: MIN_BAR_SPACING_PX,
      },
      localization: {
        locale: typeof navigator !== "undefined" ? navigator.language : "en-US",
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: BULL,
      downColor: BEAR,
      borderUpColor: BULL,
      borderDownColor: BEAR,
      wickUpColor: BULL,
      wickDownColor: BEAR,
    });

    const smaSeries = chart.addSeries(LineSeries, {
      color: SMA_COLOR,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    });

    const emaSeries = chart.addSeries(LineSeries, {
      color: EMA_COLOR,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    });

    const bbUpper = chart.addSeries(LineSeries, {
      color: BB_UPPER,
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    const bbMid = chart.addSeries(LineSeries, {
      color: BB_MID,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    const bbLower = chart.addSeries(LineSeries, {
      color: BB_LOWER,
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    const volSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "vol",
      priceFormat: { type: "volume" },
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const rsiSeries = chart.addSeries(LineSeries, {
      color: RSI_COLOR,
      lineWidth: 1,
      priceScaleId: "rsi",
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    smaSeriesRef.current = smaSeries;
    emaSeriesRef.current = emaSeries;
    bbUpperRef.current = bbUpper;
    bbMidRef.current = bbMid;
    bbLowerRef.current = bbLower;
    volSeriesRef.current = volSeries;
    rsiSeriesRef.current = rsiSeries;

    const onCrosshair = (param: MouseEventParams) => {
      if (param.time === undefined) {
        setCrosshairLegend(null);
        return;
      }
      const c = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      if (!c || typeof c.open !== "number") {
        setCrosshairLegend(null);
        return;
      }
      const parts = [
        `O ${formatPrice(c.open)} · H ${formatPrice(c.high)} · L ${formatPrice(c.low)} · C ${formatPrice(c.close)}`,
      ];
      const sp = smaPeriodRef.current;
      if (sp > 0) {
        const s = param.seriesData.get(smaSeries) as { value?: number } | undefined;
        if (s?.value !== undefined && Number.isFinite(s.value)) {
          parts.push(`SMA${sp} ${formatPrice(s.value)}`);
        }
      }
      if (showEmaRef.current) {
        const e = param.seriesData.get(emaSeries) as { value?: number } | undefined;
        if (e?.value !== undefined && Number.isFinite(e.value)) {
          parts.push(`EMA${EMA_PERIOD} ${formatPrice(e.value)}`);
        }
      }
      if (showBbRef.current) {
        const u = param.seriesData.get(bbUpper) as { value?: number } | undefined;
        const m = param.seriesData.get(bbMid) as { value?: number } | undefined;
        const l = param.seriesData.get(bbLower) as { value?: number } | undefined;
        if (
          u?.value !== undefined &&
          m?.value !== undefined &&
          l?.value !== undefined &&
          Number.isFinite(u.value) &&
          Number.isFinite(m.value) &&
          Number.isFinite(l.value)
        ) {
          parts.push(`BB ${formatPrice(l.value)} / ${formatPrice(m.value)} / ${formatPrice(u.value)}`);
        }
      }
      if (showRsiRef.current) {
        const r = param.seriesData.get(rsiSeries) as { value?: number } | undefined;
        if (r?.value !== undefined && Number.isFinite(r.value)) {
          parts.push(`RSI ${r.value.toFixed(1)}`);
        }
      }
      setCrosshairLegend(parts.join(" · "));
    };

    chart.subscribeCrosshairMove(onCrosshair);

    return () => {
      chart.unsubscribeCrosshairMove(onCrosshair);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      smaSeriesRef.current = null;
      emaSeriesRef.current = null;
      bbUpperRef.current = null;
      bbMidRef.current = null;
      bbLowerRef.current = null;
      volSeriesRef.current = null;
      rsiSeriesRef.current = null;
      priceLineRefs.current = [];
    };
  }, [merged.length]);

  React.useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const smaSeries = smaSeriesRef.current;
    const emaSeries = emaSeriesRef.current;
    const bbU = bbUpperRef.current;
    const bbM = bbMidRef.current;
    const bbL = bbLowerRef.current;
    const volSeries = volSeriesRef.current;
    const rsiSeries = rsiSeriesRef.current;
    const chart = chartRef.current;
    if (
      !candleSeries ||
      !smaSeries ||
      !emaSeries ||
      !bbU ||
      !bbM ||
      !bbL ||
      !volSeries ||
      !rsiSeries ||
      !chart ||
      merged.length === 0
    )
      return;

    candleSeries.setData(candleData);
    smaSeries.setData(smaData);
    smaSeries.applyOptions({ visible: smaPeriod > 0 });
    emaSeries.setData(emaData);
    emaSeries.applyOptions({ visible: showEma });
    bbU.setData(showBb ? bb.upper : []);
    bbM.setData(showBb ? bb.middle : []);
    bbL.setData(showBb ? bb.lower : []);
    bbU.applyOptions({ visible: showBb });
    bbM.applyOptions({ visible: showBb });
    bbL.applyOptions({ visible: showBb });
    volSeries.setData(showVolume ? volData : []);
    volSeries.applyOptions({ visible: showVolume });
    rsiSeries.setData(showRsi ? rsiData : []);
    rsiSeries.applyOptions({ visible: showRsi });

    let mainBottom = 0.12;
    if (showVolume && showRsi) mainBottom = 0.38;
    else if (showRsi) mainBottom = 0.28;
    else if (showVolume) mainBottom = 0.22;

    candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.04, bottom: mainBottom },
    });

    chart.priceScale("vol").applyOptions({
      scaleMargins: showVolume
        ? showRsi
          ? { top: 0.62, bottom: 0.22 }
          : { top: 0.78, bottom: 0.06 }
        : { top: 1, bottom: 0 },
    });

    chart.priceScale("rsi").applyOptions({
      scaleMargins: showRsi ? { top: 0.78, bottom: 0.02 } : { top: 1, bottom: 0 },
    });

    chart.timeScale().fitContent();
    const el = containerRef.current;
    const width = el?.clientWidth ?? 0;
    const bars = candleData.length;
    chart.timeScale().applyOptions({
      maxBarSpacing: MAX_BAR_SPACING_PX,
      minBarSpacing: MIN_BAR_SPACING_PX,
      rightOffset: 0,
      barSpacing: computeBarSpacingForFill(width, bars),
    });
  }, [
    candleData,
    smaData,
    smaPeriod,
    emaData,
    showEma,
    bb,
    showBb,
    volData,
    showVolume,
    rsiData,
    showRsi,
    merged.length,
  ]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || merged.length === 0) return;

    const applyHorizontalFit = () => {
      const chart = chartRef.current;
      if (!chart) return;
      const n = candleBarCountRef.current;
      if (n <= 0) return;
      chart.timeScale().fitContent();
      chart.timeScale().applyOptions({
        maxBarSpacing: MAX_BAR_SPACING_PX,
        minBarSpacing: MIN_BAR_SPACING_PX,
        rightOffset: 0,
        barSpacing: computeBarSpacingForFill(el.clientWidth, n),
      });
    };

    const ro = new ResizeObserver(() => applyHorizontalFit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [merged.length]);

  React.useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    if (!candleSeries || merged.length === 0) return;

    for (const pl of priceLineRefs.current) {
      candleSeries.removePriceLine(pl);
    }
    priceLineRefs.current = [];

    const o = tradingOverlay;
    if (!o) return;

    if (o.averageEntryPrice != null && Number.isFinite(o.averageEntryPrice)) {
      priceLineRefs.current.push(
        candleSeries.createPriceLine({
          price: o.averageEntryPrice,
          title: "Entrée",
          color: "#38BDF8",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
        }),
      );
    }
    if (o.stopLoss != null && Number.isFinite(o.stopLoss)) {
      priceLineRefs.current.push(
        candleSeries.createPriceLine({
          price: o.stopLoss,
          title: "Stop",
          color: "#F87171",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
        }),
      );
    }
    if (o.takeProfit != null && Number.isFinite(o.takeProfit)) {
      priceLineRefs.current.push(
        candleSeries.createPriceLine({
          price: o.takeProfit,
          title: "TP",
          color: "#4ADE80",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
        }),
      );
    }
  }, [tradingOverlay, merged.length]);

  const chartHeight =
    merged.length === 0 ? 200 : showVolume && showRsi ? 460 : showRsi || showVolume ? 420 : 380;

  const legendPrimary = crosshairLegend ?? staticLegend?.ohlc ?? null;
  const legendSma = crosshairLegend ? null : staticLegend?.sma;
  const legendEma = crosshairLegend ? null : staticLegend?.ema;
  const legendRsi = crosshairLegend ? null : staticLegend?.rsi;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0e14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      {merged.length > 0 ? (
        <div className="flex flex-col gap-2 border-b border-white/[0.06] bg-[#0d1117]/80 px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#E6EDF3]/40">
              Outils
            </span>
            <label className="flex items-center gap-1.5 text-[10px] text-[#E6EDF3]/65 sm:text-[11px]">
              <span className="whitespace-nowrap">SMA</span>
              <select
                value={smaPeriod}
                onChange={(e) => setSmaPeriod(Number(e.target.value) as SmaChoice)}
                className="rounded border border-white/15 bg-[#111827] px-2 py-1 text-[10px] text-[#E6EDF3] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 sm:text-[11px]"
                aria-label="Période SMA"
              >
                <option value={0}>Off</option>
                <option value={9}>9</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#E6EDF3]/65 sm:text-[11px]">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-white/20 bg-[#111827]"
                checked={showEma}
                onChange={(e) => setShowEma(e.target.checked)}
              />
              EMA {EMA_PERIOD}
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#E6EDF3]/65 sm:text-[11px]">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-white/20 bg-[#111827]"
                checked={showBb}
                onChange={(e) => setShowBb(e.target.checked)}
              />
              BB ({BB_PERIOD},{BB_MULT})
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#E6EDF3]/65 sm:text-[11px]">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-white/20 bg-[#111827]"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
              />
              Volume (estim.)
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#E6EDF3]/65 sm:text-[11px]">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-white/20 bg-[#111827]"
                checked={showRsi}
                onChange={(e) => setShowRsi(e.target.checked)}
              />
              RSI ({RSI_PERIOD})
            </label>
          </div>
          <p className="text-[10px] leading-relaxed text-[#E6EDF3]/38 sm:text-[11px]">
            Style terminal : zoom molette, pincer, glisser. Lignes Entrée / Stop / TP si position
            simulée sur ce symbole.
          </p>
        </div>
      ) : null}

      {staticLegend || merged.length > 0 ? (
        <div className="flex flex-col gap-1 border-b border-white/[0.06] px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <p className="font-mono text-[10px] leading-relaxed text-[#E6EDF3]/50 sm:text-[11px]">
            {legendPrimary}
            {crosshairLegend ? <span className="ml-2 text-sky-400/90">· curseur</span> : null}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px]">
            {legendSma ? (
              <span className="font-medium" style={{ color: SMA_COLOR }}>
                {legendSma}
              </span>
            ) : null}
            {legendEma && showEma ? (
              <span className="font-medium" style={{ color: EMA_COLOR }}>
                {legendEma}
              </span>
            ) : null}
            {legendRsi ? (
              <span className="font-medium" style={{ color: RSI_COLOR }}>
                {legendRsi}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="relative w-full"
        style={{
          minHeight: merged.length === 0 ? 200 : CHART_MIN_H,
          height: merged.length === 0 ? 200 : chartHeight,
        }}
        aria-label="Graphique chandelier avec indicateurs et lignes de trading"
      >
        {merged.length === 0 ? (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-b-xl text-sm text-[#E6EDF3]/55"
            role="status"
          >
            Aucune donnée de bougies pour cette période.
          </div>
        ) : null}
      </div>
    </div>
  );
}
