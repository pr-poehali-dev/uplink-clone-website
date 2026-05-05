export function SeoScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "text-green-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  const bg = score >= 75 ? "bg-green-500/10 border-green-500/20" : score >= 50 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-sm font-bold ${bg} ${color}`}>
      {score}/100
    </span>
  );
}
