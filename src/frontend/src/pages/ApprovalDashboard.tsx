import { CommandSimulator } from "@/components/CommandSimulator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAnalytics,
  useApprove,
  usePendingApprovals,
} from "@/hooks/use-backend";
import { cn } from "@/lib/utils";
import type { CommandLog } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  MousePointerClick,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const diff = Date.now() - ms;
  if (diff < 60_000) return `${Math.max(1, Math.round(diff / 1000))}s ago`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`;
  return `${Math.round(diff / 3_600_000)}h ago`;
}

function isNew(ts: bigint): boolean {
  const ms = Number(ts / 1_000_000n);
  return Date.now() - ms < 30_000;
}

function blastSeverityColor(s: string) {
  if (s.toLowerCase().includes("critical") || s.toLowerCase().includes("high"))
    return "text-red-400";
  if (s.toLowerCase().includes("medium")) return "text-amber-400";
  return "text-orange-400";
}

type BlastRadiusData = {
  estimatedFiles: bigint;
  estimatedRows: bigint;
  severity: string;
};

function extractBlast(log: CommandLog): BlastRadiusData | undefined {
  if (!log.blastRadius) return undefined;
  if (Array.isArray(log.blastRadius))
    return log.blastRadius[0] as BlastRadiusData | undefined;
  return log.blastRadius as BlastRadiusData;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  pulse?: boolean;
  ocid: string;
}

function StatCard({ label, value, icon, accent, pulse, ocid }: StatCardProps) {
  return (
    <div
      data-ocid={ocid}
      className={cn(
        "relative rounded-xl border bg-card px-4 py-3 flex items-center gap-3 overflow-hidden",
        accent,
      )}
    >
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold font-mono leading-tight">{value}</p>
      </div>
      {pulse && (
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      )}
    </div>
  );
}

// ─── Pending Item ─────────────────────────────────────────────────────────────

interface PendingItemProps {
  log: CommandLog;
  index: number;
  isSelected: boolean;
  onSelect: (log: CommandLog) => void;
}

function PendingItem({ log, index, isSelected, onSelect }: PendingItemProps) {
  const fresh = isNew(log.timestamp);
  const blast = extractBlast(log);

  return (
    <button
      type="button"
      data-ocid={`approval_queue.item.${index + 1}`}
      onClick={() => onSelect(log)}
      className={cn(
        "w-full text-left rounded-lg border px-3 py-3 flex flex-col gap-2 transition-smooth cursor-pointer",
        isSelected
          ? "border-cyan-500/60 bg-cyan-500/5 shadow-[0_0_0_1px_oklch(0.73_0.23_245/0.25)]"
          : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50",
      )}
    >
      {/* Top row */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/30 rounded px-1.5 py-0.5">
          <XCircle size={10} strokeWidth={2.5} />
          CRITICAL
        </span>
        {fresh && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5 animate-pulse">
            NEW
          </span>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground font-mono flex items-center gap-1">
          <Clock size={10} />
          {timeAgo(log.timestamp)}
        </span>
      </div>

      {/* Command text */}
      <code className="font-mono text-xs text-foreground/90 truncate block">
        {log.command}
      </code>

      {/* Agent row */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="font-mono text-foreground/60 truncate">
          <span className="text-muted-foreground/50">agent: </span>
          {log.agentId}
        </span>
        {isSelected && (
          <ChevronRight size={12} className="ml-auto text-cyan-400 shrink-0" />
        )}
      </div>

      {/* Blast radius summary */}
      {blast && (
        <div className="flex items-center gap-1.5 rounded bg-red-500/10 border border-red-500/20 px-2 py-1">
          <Zap size={10} className="text-red-400 shrink-0" />
          <span
            className={cn(
              "text-[11px] font-mono",
              blastSeverityColor(blast.severity),
            )}
          >
            {blast.severity.toUpperCase()} — ~{Number(blast.estimatedFiles)}{" "}
            files, ~{Number(blast.estimatedRows)} rows
          </span>
        </div>
      )}
    </button>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  log: CommandLog | null;
  onDecision: (commandId: string, decision: boolean, reason: string) => void;
  isPending: boolean;
}

function DetailPanel({ log, onDecision, isPending }: DetailPanelProps) {
  const [reason, setReason] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setReason("");
    if (log && textareaRef.current) textareaRef.current.focus();
  }, [log]);

  if (!log) {
    return (
      <div
        data-ocid="command_detail.empty_state"
        className="flex flex-col items-center justify-center h-full text-center py-16 gap-4"
      >
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
          <MousePointerClick size={28} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground/60">
            No command selected
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Select a command from the queue to review
          </p>
        </div>
      </div>
    );
  }

  const blast = extractBlast(log);
  const tsMs = Number(log.timestamp / 1_000_000n);
  const dateStr = new Date(tsMs).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div data-ocid="command_detail.panel" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
            Command Review
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/30 rounded px-2 py-1">
            <XCircle size={12} strokeWidth={2.5} />
            CRITICAL — Requires Approval
          </span>
        </div>
        <AlertTriangle size={18} className="text-red-400 shrink-0" />
      </div>

      {/* Command block */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Command
        </p>
        <div className="rounded-lg bg-secondary border border-border p-3 overflow-x-auto">
          <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-all">
            {log.command}
          </pre>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-secondary border border-border p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Agent ID
          </p>
          <p className="font-mono text-xs text-foreground truncate">
            {log.agentId}
          </p>
        </div>
        <div className="rounded-lg bg-secondary border border-border p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Timestamp
          </p>
          <p className="font-mono text-xs text-foreground">{dateStr}</p>
        </div>
      </div>

      {/* Command type */}
      <div className="rounded-lg bg-secondary border border-border p-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
          Command Type
        </p>
        <p className="font-mono text-xs text-foreground">{log.commandType}</p>
      </div>

      {/* Blast Radius */}
      {blast && (
        <div className="rounded-lg bg-red-500/8 border border-red-500/25 p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Zap size={13} className="text-red-400" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400">
              Blast Radius Analysis
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] text-red-400/60 font-mono uppercase">
                Severity
              </p>
              <p
                className={cn(
                  "text-xs font-mono font-bold",
                  blastSeverityColor(blast.severity),
                )}
              >
                {blast.severity.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-red-400/60 font-mono uppercase">
                Files
              </p>
              <p className="text-xs font-mono font-bold text-red-300">
                ~{Number(blast.estimatedFiles)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-red-400/60 font-mono uppercase">
                Rows
              </p>
              <p className="text-xs font-mono font-bold text-red-300">
                ~{Number(blast.estimatedRows)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reason field */}
      <div>
        <label
          htmlFor="review-reason"
          className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2"
        >
          Review Note (optional)
        </label>
        <Textarea
          id="review-reason"
          ref={textareaRef}
          data-ocid="command_detail.textarea"
          placeholder="Add a reason or note for the audit log..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="font-mono text-sm resize-none min-h-[72px] bg-secondary border-border focus:border-primary/60"
          rows={3}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 pt-1 border-t border-border">
        <Button
          type="button"
          data-ocid="command_detail.approve_button"
          onClick={() => onDecision(log.id, true, reason)}
          disabled={isPending}
          className={cn(
            "w-full h-11 text-sm font-bold gap-2",
            "bg-emerald-600 hover:bg-emerald-500 text-white border-0",
            "shadow-[0_0_16px_oklch(0.58_0.19_135/0.2)] hover:shadow-[0_0_20px_oklch(0.58_0.19_135/0.4)]",
            "transition-smooth disabled:opacity-50",
          )}
        >
          <CheckCircle2 size={16} strokeWidth={2.5} />
          {isPending ? "Processing..." : "Approve Command"}
        </Button>
        <Button
          type="button"
          data-ocid="command_detail.reject_button"
          onClick={() => onDecision(log.id, false, reason)}
          disabled={isPending}
          className={cn(
            "w-full h-11 text-sm font-bold gap-2",
            "bg-red-700 hover:bg-red-600 text-white border-0",
            "shadow-[0_0_16px_oklch(0.63_0.23_25/0.15)] hover:shadow-[0_0_20px_oklch(0.63_0.23_25/0.35)]",
            "transition-smooth disabled:opacity-50",
          )}
        >
          <X size={16} strokeWidth={2.5} />
          Reject Command
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApprovalDashboard() {
  const { data: pending, isLoading: loadingPending } =
    usePendingApprovals(5000);
  const { data: analytics, isLoading: loadingAnalytics } = useAnalytics(10000);
  const approve = useApprove();
  const [selected, setSelected] = useState<CommandLog | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Deselect if the selected command is no longer in the pending list
  useEffect(() => {
    if (!selected || !pending) return;
    const stillPending = pending.some((p) => p.id === selected.id);
    if (!stillPending) setSelected(null);
  }, [pending, selected]);

  function handleDecision(
    commandId: string,
    decision: boolean,
    reason: string,
  ) {
    approve.mutate(
      {
        commandId,
        decision,
        callerId: "dashboard-operator",
        reason: reason || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success(decision ? "Command approved" : "Command rejected", {
              description: result.message,
            });
          } else {
            toast.error("Action failed", { description: result.message });
          }
          setSelected(null);
        },
        onError: (err) => {
          toast.error("Failed to submit decision", {
            description: err.message,
          });
        },
      },
    );
  }

  const pendingCount = pending?.length ?? 0;
  const approvedToday = analytics ? Number(analytics.approvedCommands) : 0;
  const rejectedToday = analytics ? Number(analytics.rejectedCommands) : 0;
  const autoExecuted = analytics
    ? Number(analytics.greenCommands) + Number(analytics.yellowCommands)
    : 0;
  const activeAgents = analytics ? Number(analytics.activeAgents) : 0;

  return (
    <div data-ocid="approval_dashboard.page" className="flex flex-col h-full">
      {/* Page Header + Stats */}
      <div className="px-6 pt-5 pb-4 border-b border-border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <ShieldAlert size={18} className="text-red-400" />
              <h1 className="text-xl font-bold font-display tracking-tight">
                Command Approval Queue
              </h1>
              {pendingCount > 0 && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-mono text-xs animate-pulse">
                  {pendingCount} pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Review and approve AI agent commands requiring human authorization
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Users size={13} />
            <span className="font-mono">
              {activeAgents} active agent{activeAgents !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <StatCard
            ocid="stats.pending_approvals"
            label="Pending Approvals"
            value={loadingPending ? "—" : pendingCount}
            icon={<AlertTriangle size={20} className="text-amber-400" />}
            accent="border-amber-500/20"
            pulse={pendingCount > 0}
          />
          <StatCard
            ocid="stats.approved_today"
            label="Approved Today"
            value={loadingAnalytics ? "—" : approvedToday}
            icon={<CheckCircle2 size={20} className="text-emerald-400" />}
            accent="border-emerald-500/20"
          />
          <StatCard
            ocid="stats.rejected_today"
            label="Rejected Today"
            value={loadingAnalytics ? "—" : rejectedToday}
            icon={<XCircle size={20} className="text-red-400" />}
            accent="border-red-500/20"
          />
          <StatCard
            ocid="stats.auto_executed"
            label="Auto-Executed"
            value={loadingAnalytics ? "—" : autoExecuted}
            icon={<Zap size={20} className="text-cyan-400" />}
            accent="border-cyan-500/20"
          />
        </div>
      </div>

      {/* Command Simulator */}
      <div className="px-4 py-2 border-b border-border bg-background">
        <button
          type="button"
          data-ocid="simulator.toggle"
          onClick={() => setSimulatorOpen((v) => !v)}
          className="flex w-full items-center gap-2 text-left rounded-lg px-3 py-2 hover:bg-secondary transition-smooth group"
        >
          {simulatorOpen ? (
            <ChevronDown size={14} className="text-cyan-400 shrink-0" />
          ) : (
            <ChevronRight
              size={14}
              className="text-muted-foreground group-hover:text-cyan-400 transition-colors shrink-0"
            />
          )}
          <Terminal
            size={14}
            className={
              simulatorOpen
                ? "text-cyan-400"
                : "text-muted-foreground group-hover:text-cyan-400 transition-colors"
            }
          />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
            Test Commands
          </span>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground/50">
            {simulatorOpen ? "collapse" : "expand to simulate live commands"}
          </span>
        </button>
        {simulatorOpen && (
          <div className="mt-2 px-1 pb-2">
            <CommandSimulator />
          </div>
        )}
      </div>

      {/* Split Panel */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Pending Queue (60%) */}
        <div
          data-ocid="approval_queue.panel"
          className="w-[60%] border-r border-border flex flex-col min-h-0 bg-background"
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-card/50">
            <Terminal size={14} className="text-muted-foreground" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Pending Approvals
            </span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground/40 flex items-center gap-1">
              <Clock size={9} />
              auto-refresh · 5s
            </span>
          </div>

          <ScrollArea className="flex-1 px-3 py-3">
            {loadingPending ? (
              <div
                data-ocid="approval_queue.loading_state"
                className="space-y-2"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : pendingCount === 0 ? (
              <div
                data-ocid="approval_queue.empty_state"
                className="flex flex-col items-center justify-center py-16 text-center gap-3"
              >
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck size={24} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground/70">
                    No pending approvals — all systems clear
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI agents are operating within safe parameters
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {[...(pending ?? [])]
                  .sort((a, b) => Number(b.timestamp - a.timestamp))
                  .map((log, i) => (
                    <PendingItem
                      key={log.id}
                      log={log}
                      index={i}
                      isSelected={selected?.id === log.id}
                      onSelect={setSelected}
                    />
                  ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* RIGHT: Detail Panel (40%) */}
        <div
          data-ocid="command_detail.section"
          className="w-[40%] flex flex-col min-h-0 bg-background"
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-card/50">
            <ShieldAlert size={14} className="text-muted-foreground" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Review Decision
            </span>
          </div>
          <ScrollArea className="flex-1 px-4 py-4">
            <DetailPanel
              log={selected}
              onDecision={handleDecision}
              isPending={approve.isPending}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
