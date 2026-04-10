import React from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineSeries,
  LineStyle,
  createChart,
} from "lightweight-charts";
import type {
  CandlestickData,
  IChartApi,
  ISeriesApi,
  LineData,
  UTCTimestamp,
} from "lightweight-charts";
import type { CandleDto } from "../../../shared/api/types/backend";

type Props = {
  candles: CandleDto[];
};

const CHART_MIN_H = 320;

const BULL = "#22C55E";
const BEAR = "#F87171";
const SMA_COLOR = "#EAB308";

function formatPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (p >= 1) return p.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return p.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

/** Backend envoie le timestamp en ms UTC ; la lib attend des secondes (UTCTimestamp). */
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

function buildSeriesData(merged: CandleDto[], smaPeriod: number) {
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
  const smaData: LineData[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < smaPeriod - 1) continue;
    let sum = 0;
    for (let j = i - smaPeriod + 1; j <= i; j++) sum += closes[j];
    smaData.push({
      time: candleData[i].time,
      value: sum / smaPeriod,
    });
  }

  return { candleData, smaData };
}

export function AssetCandleChart({ candles }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const candleSeriesRef = React.useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = React.useRef<ISeriesApi<"Line"> | null>(null);

  const sorted = React.useMemo(() => {
    return [...candles].sort((a, b) => a.timestamp - b.timestamp);
  }, [candles]);

  const merged = React.useMemo(() => mergeCandlesBySecond(sorted), [sorted]);

  const { candleData, smaData, legend } = React.useMemo(() => {
    if (merged.length === 0) {
      return {
        candleData: [] as CandlestickData[],
        smaData: [] as LineData[],
        legend: null as { ohlc: string; sma: string | null } | null,
      };
    }
    const { candleData: cd, smaData: sd } = buildSeriesData(merged, 9);
    const last = merged[merged.length - 1];
    const ohlc = `O ${formatPrice(last.open)} · H ${formatPrice(last.high)} · L ${formatPrice(last.low)} · C ${formatPrice(last.close)}`;
    const lastSma = sd.length > 0 ? sd[sd.length - 1].value : null;
    const sma =
      lastSma !== null && Number.isFinite(lastSma) ? `SMA 9 ${formatPrice(lastSma)}` : null;
    return { candleData: cd, smaData: sd, legend: { ohlc, sma } };
  }, [merged]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || merged.length === 0) {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
        lineSeriesRef.current = null;
      }
      return;
    }

    if (chartRef.current) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#0d1117" },
        textColor: "rgba(230, 237, 243, 0.55)",
        fontSize: 11,
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(234, 179, 8, 0.35)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#1f2937",
        },
        horzLine: {
          color: "rgba(234, 179, 8, 0.35)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#1f2937",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        scaleMargins: { top: 0.08, bottom: 0.12 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        locale: typeof navigator !== "undefined" ? navigator.language : "en-US",
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: BULL,
      downColor: BEAR,
      borderUpColor: BULL,
      borderDownColor: BEAR,
      wickUpColor: BULL,
      wickDownColor: BEAR,
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: SMA_COLOR,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: true,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current = lineSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
    };
  }, [merged.length]);

  React.useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const lineSeries = lineSeriesRef.current;
    const chart = chartRef.current;
    if (!candleSeries || !lineSeries || !chart || merged.length === 0) return;

    candleSeries.setData(candleData);
    lineSeries.setData(smaData);
    chart.timeScale().fitContent();
  }, [candleData, smaData, merged.length]);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1117] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      {legend ? (
        <div className="flex flex-col gap-1 border-b border-white/[0.06] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="font-mono text-[10px] leading-relaxed text-[#E6EDF3]/45 sm:text-[11px]">
            {legend.ohlc}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#E6EDF3]/40 sm:text-[11px]">
            {legend.sma ? (
              <span className="font-medium" style={{ color: SMA_COLOR }}>
                {legend.sma}
              </span>
            ) : null}
            <span className="hidden sm:inline">Molette · pinch · glisser pour naviguer</span>
          </div>
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{
          minHeight: merged.length === 0 ? 200 : CHART_MIN_H,
          height: merged.length === 0 ? 200 : 360,
        }}
        aria-label="Graphique chandelier OHLC interactif"
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
