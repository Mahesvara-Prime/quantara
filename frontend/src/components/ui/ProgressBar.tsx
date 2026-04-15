/**
 * Barre de progression 0–100 % (Learn, cours, leçon, Progress).
 */
export function ProgressBar({ pct }: { pct: number }) {
  const safePct = Math.max(0, Math.min(100, pct));
  return (
    <div className="w-full">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${safePct}%` }} />
      </div>
    </div>
  );
}
