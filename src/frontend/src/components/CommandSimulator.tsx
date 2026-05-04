import { RiskLevel, Variant_pending_blocked_allowed } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useIntercept } from "@/hooks/use-backend";
import { cn } from "@/lib/utils";
import type { InterceptResult } from "@/types";
import { AlertTriangle, CheckCircle2, Loader2, Play, Zap } from "lucide-react";
import { useState } from "react";

// ─── Presets ──────────────────────────────────────────────────────────────────

type PresetRisk = "green" | "yellow" | "red";

type Preset = {
  label: string;
  command: string;
  commandType: string;
  risk: PresetRisk;
};

const PRESETS: Preset[] = [
  {
    label: "ls -la",
    command: "ls -la",
    commandType: "terminal",
    risk: "green",
  },
  {
    label: "git status",
    command: "git status",
    commandType: "terminal",
    risk: "green",
  },
  {
    label: "cat README.md",
    command: "cat README.md",
    commandType: "terminal",
    risk: "green",
  },
  {
    label: "npm run dev",
    command: "npm run dev",
    commandType: "terminal",
    risk: "green",
  },
  {
    label: "npm install lodash",
    command: "npm install lodash",
    commandType: "terminal",
    risk: "yellow",
  },
  {
    label: "git commit",
    command: 'git commit -m "update config"',
    commandType: "terminal",
    risk: "yellow",
  },
  {
    label: "mkdir /tmp/build",
    command: "mkdir /tmp/build",
    commandType: "terminal",
    risk: "yellow",
  },
  {
    label: "rm -rf /var/data",
    command: "rm -rf /var/data",
    commandType: "terminal",
    risk: "red",
  },
  {
    label: "DROP TABLE users",
    command: "DROP TABLE users",
    commandType: "db_query",
    risk: "red",
  },
  {
    label: "TRUNCATE audit_logs",
    command: "TRUNCATE TABLE audit_logs",
    commandType: "db_query",
    risk: "red",
  },
  {
    label: "fdisk /dev/sda",
    command: "fdisk /dev/sda",
    commandType: "terminal",
    risk: "red",
  },
];

const RISK_CHIP_STYLES: Record<PresetRisk, string> = {
  green:
    "border-emerald-500/40 text-emerald-400 bg-emerald-500/8 hover:bg-emerald-500/20",
  yellow:
    "border-amber-500/40 text-amber-400 bg-amber-500/8 hover:bg-amber-500/20",
  red: "border-red-500/40 text-red-400 bg-red-500/8 hover:bg-red-500/20",
};

// ─── Result Card ──────────────────────────────────────────────────────────────

type RiskColors = {
  border: string;
  bg: string;
  text: string;
  glow: string;
  isRed: boolean;
  isGreen: boolean;
};

function getRiskColors(result: InterceptResult): RiskColors {
  if (result.riskLevel === RiskLevel.green)
    return {
      border: "border-emerald-500/60",
      bg: "bg-emerald-500/6",
      text: "text-emerald-400",
      glow: "shadow-[0_0_12px_oklch(0.58_0.19_135/0.15)]",
      isRed: false,
      isGreen: true,
    };
  if (result.riskLevel === RiskLevel.yellow)
    return {
      border: "border-amber-500/60",
      bg: "bg-amber-500/6",
      text: "text-amber-400",
      glow: "shadow-[0_0_12px_oklch(0.83_0.19_84/0.15)]",
      isRed: false,
      isGreen: false,
    };
  return {
    border: "border-red-500/60",
    bg: "bg-red-500/6",
    text: "text-red-400",
    glow: "shadow-[0_0_12px_oklch(0.63_0.23_25/0.15)]",
    isRed: true,
    isGreen: false,
  };
}

function ResultCard({ result }: { result: InterceptResult }) {
  const colors = getRiskColors(result);
  const risk = result.riskLevel.toUpperCase();
  const status =
    result.status === Variant_pending_blocked_allowed.pending
      ? "PENDING APPROVAL"
      : result.status === Variant_pending_blocked_allowed.blocked
        ? "BLOCKED"
        : "ALLOWED";
  const blast = result.blastRadius ?? null;

  return (
    <div
      data-ocid="simulator.result_card"
      className={cn(
        "rounded-lg border-l-4 border border-border p-3.5 space-y-2.5",
        colors.border,
        colors.bg,
        colors.glow,
      )}
    >
      {/* Risk + Status row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded px-2 py-0.5 border",
            colors.text,
            colors.border,
          )}
        >
          {colors.isRed ? (
            <AlertTriangle size={9} strokeWidth={2.5} />
          ) : (
            <CheckCircle2 size={9} strokeWidth={2.5} />
          )}
          {risk}
        </span>
        <span className="inline-flex items-center text-[10px] font-mono font-bold uppercase tracking-widest bg-secondary text-muted-foreground border border-border rounded px-2 py-0.5">
          {status}
        </span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground/60 truncate">
          ID: {result.id}
        </span>
      </div>

      {/* Reason */}
      {result.reason && (
        <p className="text-xs text-muted-foreground font-mono">
          {result.reason}
        </p>
      )}

      {/* Blast radius */}
      {blast && (
        <div className="flex items-center gap-1.5 rounded bg-red-500/10 border border-red-500/20 px-2 py-1.5">
          <Zap size={10} className="text-red-400 shrink-0" />
          <span className="text-[11px] font-mono text-red-400">
            {blast.severity.toUpperCase()} — ~{Number(blast.estimatedFiles)}{" "}
            files, ~{Number(blast.estimatedRows)} rows
          </span>
        </div>
      )}

      {/* Callout */}
      {colors.isRed ? (
        <div className="flex items-start gap-2 rounded bg-amber-500/10 border border-amber-500/25 px-2.5 py-2">
          <Zap size={12} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300 font-medium leading-snug">
            ⚡ This command is now in the{" "}
            <strong className="text-amber-200">Pending Queue</strong> below —
            review and approve/reject it in real time.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-start gap-2 rounded border px-2.5 py-2",
            colors.isGreen
              ? "bg-emerald-500/8 border-emerald-500/20"
              : "bg-amber-500/8 border-amber-500/20",
          )}
        >
          <CheckCircle2
            size={12}
            className={cn(
              "mt-0.5 shrink-0",
              colors.isGreen ? "text-emerald-400" : "text-amber-400",
            )}
          />
          <p
            className={cn(
              "text-xs font-medium leading-snug",
              colors.isGreen ? "text-emerald-300" : "text-amber-300",
            )}
          >
            ✓ Command auto-executed — classified as <strong>{risk}</strong>, no
            approval needed.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CommandSimulator() {
  const [agentId, setAgentId] = useState("agent-test-01");
  const [commandType, setCommandType] = useState("terminal");
  const [command, setCommand] = useState("");
  const intercept = useIntercept();

  function applyPreset(preset: Preset) {
    setCommand(preset.command);
    setCommandType(preset.commandType);
  }

  function handleFire() {
    if (!command.trim()) return;
    intercept.mutate({
      command: command.trim(),
      agentId: agentId.trim() || "agent-test-01",
      commandType,
    });
  }

  return (
    <div data-ocid="simulator.panel" className="flex flex-col gap-4">
      {/* Controls row */}
      <div className="grid grid-cols-[1fr_160px] gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="sim-agent-id"
            className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
          >
            Agent ID
          </Label>
          <Input
            id="sim-agent-id"
            data-ocid="simulator.agent_id.input"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="font-mono text-xs bg-secondary border-border h-8"
            placeholder="agent-test-01"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="sim-cmd-type"
            className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
          >
            Type
          </Label>
          <Select value={commandType} onValueChange={setCommandType}>
            <SelectTrigger
              id="sim-cmd-type"
              data-ocid="simulator.command_type.select"
              className="font-mono text-xs bg-secondary border-border h-8"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="terminal" className="font-mono text-xs">
                terminal
              </SelectItem>
              <SelectItem value="file_op" className="font-mono text-xs">
                file_op
              </SelectItem>
              <SelectItem value="db_query" className="font-mono text-xs">
                db_query
              </SelectItem>
              <SelectItem value="api_call" className="font-mono text-xs">
                api_call
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preset chips */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Quick Presets
        </p>
        <ScrollArea className="w-full">
          <div className="flex gap-1.5 flex-wrap pb-1">
            {PRESETS.map((preset) => (
              <button
                key={preset.command}
                type="button"
                data-ocid={`simulator.preset.${preset.risk}`}
                onClick={() => applyPreset(preset)}
                className={cn(
                  "inline-flex items-center text-[11px] font-mono px-2 py-1 rounded border transition-smooth cursor-pointer whitespace-nowrap",
                  RISK_CHIP_STYLES[preset.risk],
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Command textarea */}
      <div className="space-y-1.5">
        <Label
          htmlFor="sim-command"
          className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
        >
          Command{" "}
          <span className="normal-case text-muted-foreground/50">
            (Ctrl+Enter to fire)
          </span>
        </Label>
        <Textarea
          id="sim-command"
          data-ocid="simulator.command.textarea"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleFire();
          }}
          placeholder="Type a command or select a preset above..."
          rows={2}
          className="font-mono text-sm resize-none bg-secondary border-border focus:border-primary/60 min-h-[60px]"
        />
      </div>

      {/* Fire button */}
      <Button
        type="button"
        data-ocid="simulator.fire_button"
        onClick={handleFire}
        disabled={!command.trim() || intercept.isPending}
        className={cn(
          "w-full h-10 text-sm font-bold gap-2",
          "bg-primary text-primary-foreground hover:opacity-90",
          "shadow-[0_0_16px_oklch(0.73_0.23_245/0.2)] hover:shadow-[0_0_24px_oklch(0.73_0.23_245/0.35)]",
          "transition-smooth disabled:opacity-40",
        )}
      >
        {intercept.isPending ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Intercepting...
          </>
        ) : (
          <>
            <Play size={15} strokeWidth={2.5} />
            Fire Command
          </>
        )}
      </Button>

      {/* Result */}
      {intercept.data && <ResultCard result={intercept.data} />}
      {intercept.isError && (
        <div
          data-ocid="simulator.error_state"
          className="rounded-lg border border-red-500/30 bg-red-500/8 px-3 py-2.5"
        >
          <p className="text-xs text-red-400 font-mono">
            Error: {intercept.error?.message ?? "Unknown error"}
          </p>
        </div>
      )}
    </div>
  );
}
