import type { CandlestickData, HistogramData, LineData, UTCTimestamp } from "lightweight-charts";

/** RSI Wilder — aligné sur `candleData[i].time` à partir de l’index `period`. */
export function rsiLine(candleData: CandlestickData[], closes: number[], period: number): LineData[] {
  if (candleData.length < period + 1) return [];
  const result: LineData[] = [];

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const ch = closes[i] - closes[i - 1];
    if (ch >= 0) gainSum += ch;
    else lossSum += -ch;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  const rsiVal = (ag: number, al: number) => {
    if (al === 0) return 100;
    const rs = ag / al;
    return 100 - 100 / (1 + rs);
  };

  for (let i = period; i < closes.length; i++) {
    if (i > period) {
      const ch = closes[i] - closes[i - 1];
      const g = ch > 0 ? ch : 0;
      const l = ch < 0 ? -ch : 0;
      avgGain = (avgGain * (period - 1) + g) / period;
      avgLoss = (avgLoss * (period - 1) + l) / period;
    }
    result.push({
      time: candleData[i].time,
      value: rsiVal(avgGain, avgLoss),
    });
  }
  return result;
}

/** SMA classique alignée sur `candleData[i].time`. */
export function smaLine(
  candleData: CandlestickData[],
  closes: number[],
  period: number,
): LineData[] {
  if (period <= 0) return [];
  const out: LineData[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j];
    out.push({ time: candleData[i].time, value: sum / period });
  }
  return out;
}

/** EMA : première valeur = SMA(period), puis lissage exponentiel. */
export function emaLine(
  candleData: CandlestickData[],
  closes: number[],
  period: number,
): LineData[] {
  if (period <= 0 || closes.length === 0) return [];
  const k = 2 / (period + 1);
  const out: LineData[] = [];
  let sum = 0;
  for (let i = 0; i < period && i < closes.length; i++) sum += closes[i];
  if (closes.length < period) return [];
  let ema = sum / period;
  out.push({ time: candleData[period - 1].time, value: ema });
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    out.push({ time: candleData[i].time, value: ema });
  }
  return out;
}

/** Bandes de Bollinger (SMA milieu, écart-type population sur la fenêtre). */
export function bollingerLines(
  candleData: CandlestickData[],
  closes: number[],
  period: number,
  mult: number,
): { upper: LineData[]; middle: LineData[]; lower: LineData[] } {
  const upper: LineData[] = [];
  const middle: LineData[] = [];
  const lower: LineData[] = [];
  if (period < 2 || closes.length < period) {
    return { upper, middle, lower };
  }
  for (let i = period - 1; i < closes.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j];
    const mid = sum / period;
    let varSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = closes[j] - mid;
      varSum += d * d;
    }
    const std = Math.sqrt(varSum / period);
    const t = candleData[i].time;
    middle.push({ time: t, value: mid });
    upper.push({ time: t, value: mid + mult * std });
    lower.push({ time: t, value: mid - mult * std });
  }
  return { upper, middle, lower };
}

const VOL_BULL = "rgba(34, 197, 94, 0.45)";
const VOL_BEAR = "rgba(248, 113, 113, 0.45)";

/** Proxy de « volume » sans donnée exchange : amplitude bougie + corps (visuel type terminal). */
export function volumeHistogramData(candleData: CandlestickData[]): HistogramData[] {
  return candleData.map((c) => {
    const body = Math.abs(c.close - c.open);
    const range = c.high - c.low;
    const v = body + range * 0.25;
    const bull = c.close >= c.open;
    return {
      time: c.time as UTCTimestamp,
      value: Math.max(v, range * 0.05),
      color: bull ? VOL_BULL : VOL_BEAR,
    };
  });
}
