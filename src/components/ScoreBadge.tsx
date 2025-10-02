import { Badge } from "@/components/ui/badge";

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    } else if (score >= 60) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    } else if (score >= 40) {
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
    } else {
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getScoreColor(score)} text-xs font-medium border-0`}
      data-testid={`badge-score-${score}`}
    >
      {score}%
    </Badge>
  );
}
