interface ConfidenceScoreProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ConfidenceScore({ score, showLabel = true, size = "md" }: ConfidenceScoreProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "bg-primary";
    if (score >= 60) return "bg-chart-2";
    return "bg-muted-foreground";
  };

  const heights = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-2.5"
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative bg-secondary rounded-full overflow-hidden">
        <div 
          className={`${heights[size]} ${getColor(score)} transition-all rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-sm font-medium min-w-[3rem] text-right">
          {score}%
        </span>
      )}
    </div>
  );
}
