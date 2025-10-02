import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { DataStatus } from "@shared/types";

interface StatusBadgeProps {
  status: DataStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    approved: {
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      label: "Approved"
    },
    pending: {
      icon: Clock,
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
      label: "Pending"
    },
    rejected: {
      icon: XCircle,
      className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      label: "Rejected"
    }
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} text-xs font-medium gap-1 border-0`}
      data-testid={`badge-status-${status}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
