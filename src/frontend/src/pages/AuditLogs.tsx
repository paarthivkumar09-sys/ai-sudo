import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommandLogs } from "@/hooks/use-backend";
import { cn } from "@/lib/utils";
import type { CommandLog, CommandStatus, RiskLevel } from "@/types";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Filter,
  ListFilter,
  Search,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type DateRange = "1h" | "6h" | "24h" | "7d";

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "1h", label: "Last 1h" },
  { value: "6h", label: "Last 6h" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
];

const RISK_OPTIONS = [
  { value: "all", label: "All Risks" },
  { value: "green", label: "GREEN" },
  { value: "yellow", label: "YELLOW" },
  { value: "red", label: "RED" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "allowed", label: "Allowed" },
  { value: "blocked", label: "Blocked" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toMs(ts: bigint): number {
  return Number(ts / 1_000_000n);
}

function relativeTime(ts: bigint): string {
  const diffS = Math.floor((Date.now() - toMs(ts)) / 1000);
  if (diffS < 5) return "just now";
  if (diffS < 60) return `${diffS}s ago`;
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m ago`;
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h ago`;
  return `${Math.floor(diffS / 86400)}d ago`;
}

function fullTimestamp(ts: bigint): string {
  return new Date(toMs(ts)).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function dateRangeCutoff(range: DateRange): number {
  const MS: Record<DateRange, number> = {
    "1h": 3_600_000,
    "6h": 21_600_000,
    "24h": 86_400_000,
    "7d": 604_800_000,
  };
  return Date.now() - MS[range];
}

// ─── CopyButton ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void copy();
      }}
      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      aria-label="Copy command"
    >
      {copied ? (
        <Check size={12} className="text-emerald-400" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

// ─── BlastRadiusBlock ────────────────────────────────────────────────────────

function BlastRadiusBlock({ log }: { log: CommandLog }) {
  const br = Array.isArray(log.blastRadius)
    ? log.blastRadius[0]
    : log.blastRadius;
  if (!br) return null;
  const severityColor =
    br.severity.toLowerCase() === "critical"
      ? "text-red-400 border-red-500/30 bg-red-500/10"
      : br.severity.toLowerCase() === "high"
        ? "text-orange-400 border-orange-500/30 bg-orange-500/10"
        : "text-amber-400 border-amber-500/30 bg-amber-500/10";
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2",
        severityColor,
      )}
    >
      <Zap size={12} className="shrink-0" />
      <span className="font-mono text-xs">
        Blast Radius — {br.severity.toUpperCase()}: ~{Number(br.estimatedFiles)}{" "}
        files, ~{Number(br.estimatedRows)} rows
      </span>
    </div>
  );
}

// ─── ExpandedRow ─────────────────────────────────────────────────────────────

function ExpandedRow({ log }: { log: CommandLog }) {
  return (
    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/50 bg-muted/20">
      <div className="space-y-1">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Full Command
        </p>
        <div className="flex items-start gap-2">
          <code className="flex-1 font-mono text-xs text-foreground bg-background rounded border border-border px-3 py-2 break-all">
            {log.command}
          </code>
          <CopyButton text={log.command} />
        </div>
      </div>

      <BlastRadiusBlock log={log} />

      {log.approverId && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
          <div>
            <span className="text-muted-foreground">Approver: </span>
            <span className="font-mono text-foreground">{log.approverId}</span>
          </div>
          {log.approverReason && (
            <div>
              <span className="text-muted-foreground">Reason: </span>
              <span className="text-foreground/80 italic">
                "{log.approverReason}"
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── LogRow ──────────────────────────────────────────────────────────────────

function LogRow({
  log,
  index,
  expanded,
  onToggle,
}: {
  log: CommandLog;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cmdPreview =
    log.command.length > 60 ? `${log.command.slice(0, 60)}...` : log.command;

  return (
    <>
      <tr
        data-ocid={`logs.item.${index + 1}`}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
        tabIndex={0}
        className={cn(
          "cursor-pointer transition-colors hover:bg-muted/40",
          expanded && "bg-muted/30",
        )}
      >
        {/* Time */}
        <td
          className="px-4 py-3 whitespace-nowrap"
          title={fullTimestamp(log.timestamp)}
        >
          <span className="font-mono text-xs text-muted-foreground">
            {relativeTime(log.timestamp)}
          </span>
        </td>

        {/* Agent */}
        <td className="px-4 py-3">
          <span className="font-mono text-xs text-foreground/80 truncate max-w-[120px] block">
            {log.agentId}
          </span>
        </td>

        {/* Command */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <code className="font-mono text-xs text-foreground truncate max-w-[280px]">
              {cmdPreview}
            </code>
            <CopyButton text={log.command} />
          </div>
        </td>

        {/* Risk */}
        <td className="px-4 py-3 whitespace-nowrap">
          <RiskBadge level={log.riskLevel as RiskLevel} size="sm" />
        </td>

        {/* Status */}
        <td className="px-4 py-3 whitespace-nowrap">
          <StatusBadge status={log.status as CommandStatus} />
        </td>

        {/* Approver */}
        <td className="px-4 py-3">
          <span className="font-mono text-xs text-muted-foreground">
            {log.approverId ?? "—"}
          </span>
        </td>

        {/* Expand toggle */}
        <td className="px-3 py-3 text-right">
          {expanded ? (
            <ChevronDown size={14} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
          )}
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} className="p-0">
            <ExpandedRow log={log} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── SkeletonRows ─────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <tr key={i} className="border-b border-border/50">
          <td className="px-4 py-3">
            <Skeleton className="h-3 w-16" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-3 w-24" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-3 w-48" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-5 w-16 rounded" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-5 w-16 rounded" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-3 w-20" />
          </td>
          <td className="px-3 py-3">
            <Skeleton className="h-4 w-4 rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── FilterSelect ─────────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  options,
  ocid,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  ocid: string;
}) {
  return (
    <select
      data-ocid={ocid}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── AuditLogs ───────────────────────────────────────────────────────────────

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>("24h");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: logs, isLoading } = useCommandLogs(undefined, 10_000);

  const hasFilters =
    search ||
    riskFilter !== "all" ||
    statusFilter !== "all" ||
    dateRange !== "24h";

  const clearFilters = () => {
    setSearch("");
    setRiskFilter("all");
    setStatusFilter("all");
    setDateRange("24h");
  };

  const filtered = useMemo(() => {
    if (!logs) return [];
    const cutoff = dateRangeCutoff(dateRange);
    return logs
      .filter((l) => toMs(l.timestamp) >= cutoff)
      .filter((l) => riskFilter === "all" || String(l.riskLevel) === riskFilter)
      .filter(
        (l) => statusFilter === "all" || String(l.status) === statusFilter,
      )
      .filter((l) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          l.command.toLowerCase().includes(q) ||
          l.agentId.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [logs, riskFilter, statusFilter, dateRange, search]);

  const totalInSystem = logs?.length ?? 0;

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Page Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <ListFilter size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground leading-tight">
                Audit Logs
              </h1>
              <p className="text-xs text-muted-foreground">
                Complete record of all AI agent commands
              </p>
            </div>
          </div>

          {/* Stats summary */}
          {!isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="text-foreground font-semibold">
                {filtered.length}
              </span>
              <span>shown</span>
              <span className="text-border">·</span>
              <span className="text-foreground font-semibold">
                {totalInSystem}
              </span>
              <span>total</span>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 items-center mt-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              data-ocid="logs.search_input"
              type="text"
              placeholder="Search commands, agents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 pr-3 rounded-md border border-input bg-background text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-52"
            />
          </div>

          <FilterSelect
            value={riskFilter}
            onChange={setRiskFilter}
            options={RISK_OPTIONS}
            ocid="logs.risk_filter"
          />

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            ocid="logs.status_filter"
          />

          <FilterSelect
            value={dateRange}
            onChange={(v) => setDateRange(v as DateRange)}
            options={DATE_RANGE_OPTIONS}
            ocid="logs.date_range_filter"
          />

          {hasFilters && (
            <button
              type="button"
              data-ocid="logs.clear_filters_button"
              onClick={clearFilters}
              className="h-8 flex items-center gap-1.5 px-2.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {[
                    "Time",
                    "Agent",
                    "Command",
                    "Risk",
                    "Status",
                    "Approver",
                    "",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <SkeletonRows />
                ) : filtered.length > 0 ? (
                  filtered.map((log, i) => (
                    <LogRow
                      key={log.id}
                      log={log}
                      index={i}
                      expanded={expandedId === log.id}
                      onToggle={() => toggleExpand(log.id)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div
                        data-ocid="logs.empty_state"
                        className="py-16 flex flex-col items-center gap-3"
                      >
                        <div className="p-4 rounded-full bg-muted/50">
                          <Filter size={24} className="text-muted-foreground" />
                        </div>
                        <p className="font-display font-semibold text-foreground">
                          No commands match your filters
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hasFilters ? (
                            <>
                              Try adjusting filters or{" "}
                              <button
                                type="button"
                                onClick={clearFilters}
                                className="underline hover:text-foreground transition-colors"
                              >
                                clear them
                              </button>
                            </>
                          ) : (
                            "No commands have been logged yet."
                          )}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loading indicator for polling */}
        {!isLoading && (
          <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-muted-foreground/60">
            <AlertTriangle size={10} />
            <span>Auto-refreshes every 10 seconds</span>
          </div>
        )}
      </div>
    </div>
  );
}
