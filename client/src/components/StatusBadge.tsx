import { CheckCircle2, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Status = "high-confidence" | "low-confidence" | "processing" | "error";

interface StatusBadgeProps {
  status: Status;
  confidence?: number;
}

export function StatusBadge({ status, confidence }: StatusBadgeProps) {
  const configs = {
    "high-confidence": {
      icon: CheckCircle2,
      label: "High Confidence",
      className: "bg-success/10 text-success border-success/20",
    },
    "low-confidence": {
      icon: AlertTriangle,
      label: "Low Confidence",
      className: "bg-warning/10 text-warning border-warning/20",
    },
    processing: {
      icon: Loader2,
      label: "Processing",
      className: "bg-info/10 text-info border-info/20",
    },
    error: {
      icon: XCircle,
      label: "Error",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

  const config = configs[status] || configs.processing;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={config.className}
      data-testid={`badge-status-${status}`}
    >
      <Icon className={`h-3 w-3 mr-1.5 ${status === "processing" ? "animate-spin" : ""}`} />
      <span className="text-xs font-medium">
        {config.label}
        {confidence !== undefined && ` (${(confidence * 100).toFixed(0)}%)`}
      </span>
    </Badge>
  );
}
