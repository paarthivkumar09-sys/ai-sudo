import { cn } from "@/lib/utils";
import type { CommandLog } from "@/types";
import { Terminal, Zap } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";

interface CommandCardProps {
  log: CommandLog;
  className?: string;
  index?: number;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const date = new Date(ms);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function CommandCard({ log, className, index = 0 }: CommandCardProps) {
  return (
    <div
      data-ocid={`command_log.item.${index + 1}`}
      className={cn(
        "rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:border-primary/40 transition-smooth",
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal size={14} className="text-muted-foreground shrink-0" />
          <code className="font-mono text-xs text-foreground truncate">
            {log.command}
          </code>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RiskBadge level={log.riskLevel} size="sm" />
          <StatusBadge status={log.status} />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="text-muted-foreground/60">Agent: </span>
          <span className="font-mono text-foreground/80">{log.agentId}</span>
        </span>
        <span>
          <span className="text-muted-foreground/60">Type: </span>
          <span className="font-mono">{log.commandType}</span>
        </span>
        <span className="ml-auto font-mono text-[11px]">
          {formatTimestamp(log.timestamp)}
        </span>
      </div>

      {/* Blast radius — ICP optional fields arrive as [] | [BlastRadius] */}
      {(() => {
        const br = Array.isArray(log.blastRadius)
          ? log.blastRadius[0]
          : log.blastRadius;
        if (!br) return null;
        return (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2">
            <Zap size={12} className="text-red-400 shrink-0" />
            <span className="text-xs text-red-300 font-mono">
              Blast radius — {br.severity.toUpperCase()}: ~
              {Number(br.estimatedFiles)} files, ~{Number(br.estimatedRows)}{" "}
              rows affected
            </span>
          </div>
        );
      })()}

      {/* Approver info */}
      {log.approverId && (
        <div className="text-xs text-muted-foreground">
          <span className="text-muted-foreground/60">Reviewer: </span>
          <span className="font-mono">{log.approverId}</span>
          {log.approverReason && (
            <span className="ml-2 text-foreground/60">
              &quot;{log.approverReason}&quot;
            </span>
          )}
        </div>
      )}
    </div>
  );
}
