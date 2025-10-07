import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Pause, Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: "active" | "paused" | "scanning";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    active: {
      label: "Active",
      icon: CheckCircle2,
      className: "bg-primary/10 text-primary border-primary/20"
    },
    paused: {
      label: "Paused",
      icon: Pause,
      className: "bg-muted text-muted-foreground border-border"
    },
    scanning: {
      label: "Scanning",
      icon: Loader2,
      className: "bg-chart-2/10 text-chart-2 border-chart-2/20"
    }
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge variant="outline" className={`gap-1.5 ${className}`}>
      <Icon className={`w-3 h-3 ${status === 'scanning' ? 'animate-spin' : ''}`} />
      {label}
    </Badge>
  );
}
