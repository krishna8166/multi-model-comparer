interface SimilarityBadgeProps {
  percentage: number;
  labelA: string;
  labelB: string;
}

const SimilarityBadge = ({ percentage, labelA, labelB }: SimilarityBadgeProps) => {
  const color =
    percentage > 70 ? "text-green-500" : percentage > 40 ? "text-yellow-500" : "text-red-400";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-xs font-mono">
      <span className="text-muted-foreground">{labelA} ↔ {labelB}</span>
      <span className={`font-semibold ${color}`}>{percentage}%</span>
    </div>
  );
};

export default SimilarityBadge;
