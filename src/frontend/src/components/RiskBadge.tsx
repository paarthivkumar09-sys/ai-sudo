import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CONFIG = {
  green: {
    label: "SAFE",
    icon: CheckCircle,
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  yellow: {
    label: "CAUTION",
    icon: AlertTriangle,
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  red: {
    label: "CRITICAL",
    icon: XCircle,
    classes: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

const SIZE_CLASSES = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

const ICON_SIZE = {
  sm: 10,
  md: 12,
  lg: 14,
};

export function RiskBadge({ level, size = "md", className }: RiskBadgeProps) {
  const config = CONFIG[level];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold uppercase tracking-widest rounded border",
        config.classes,
        SIZE_CLASSES[size],
        className,
      )}
    >
      <Icon size={ICON_SIZE[size]} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}
