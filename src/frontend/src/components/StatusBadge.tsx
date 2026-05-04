import { cn } from "@/lib/utils";
import type { CommandStatus } from "@/types";

interface StatusBadgeProps {
  status: CommandStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; classes: string; pulse?: boolean }
> = {
  allowed: {
    label: "ALLOWED",
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  blocked: {
    label: "BLOCKED",
    classes: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  pending: {
    label: "PENDING",
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    pulse: true,
  },
  approved: {
    label: "APPROVED",
    classes: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  rejected: {
    label: "REJECTED",
    classes: "bg-muted text-muted-foreground border-border",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.blocked;
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold uppercase tracking-widest text-[10px] px-1.5 py-0.5 rounded border",
        config.classes,
        config.pulse && "animate-pulse",
        className,
      )}
    >
      {config.label}
    </span>
  );
}
