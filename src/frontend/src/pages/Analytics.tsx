import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics, useSystemHealth } from "@/hooks/use-backend";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ── Color constants — hex values mirror index.css OKLCH tokens ───────────────
// green → oklch(0.65 0.18 155)  yellow → oklch(0.75 0.16 85)
// red   → oklch(0.60 0.22 25)   cyan   → oklch(0.70 0.13 210)
const RISK_COLORS = {
  green: "#10b981",
  yellow: "#f59e0b",
  red: "#ef4444",
  cyan: "#06b6d4",
};

const TOOLTIP_STYLE = {
  background: "oklch(0.15 0 0)",
  border: "1px solid oklch(0.22 0 0)",
  borderRadius: "8px",
  color: "oklch(0.96 0 0)",
  fontSize: 12,
};

// ── Metric Card ───────────────────────────────────────────────────────────────
type MetricCardProps = {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  accentClass: string;
  pulse?: boolean;
  ocid: string;
};

function MetricCard({
  label,
  value,
  subtext,
  icon,
  accentClass,
  pulse,
  ocid,
}: MetricCardProps) {
  return (
    <Card
      data-ocid={ocid}
      className="relative overflow-hidden border-border bg-card px-5 py-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        <span className={`${accentClass} opacity-80`}>{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <p className={`text-3xl font-display font-bold ${accentClass}`}>
          {value}
        </p>
        {pulse && (
          <span className="mb-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-amber-500 font-mono">live</span>
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </Card>
  );
}

// ── Skeleton grid ─────────────────────────────────────────────────────────────
function MetricsSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint: index key fine here
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </>
  );
}

// ── Custom Pie label ──────────────────────────────────────────────────────────
function DonutCenterLabel({
  viewBox,
}: { viewBox?: { cx: number; cy: number } }) {
  const cx = viewBox?.cx ?? 0;
  const cy = viewBox?.cy ?? 0;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan
        x={cx}
        dy="-0.4em"
        style={{
          fill: "oklch(0.52 0 0)",
          fontSize: 10,
          fontFamily: "Space Grotesk",
        }}
      >
        Risk
      </tspan>
      <tspan
        x={cx}
        dy="1.4em"
        style={{
          fill: "oklch(0.52 0 0)",
          fontSize: 10,
          fontFamily: "Space Grotesk",
        }}
      >
        Breakdown
      </tspan>
    </text>
  );
}

// ── Uptime formatter ──────────────────────────────────────────────────────────
function formatUptime(nanos: bigint): string {
  const seconds = Number(nanos / 1_000_000_000n);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(10000);
  const { data: health, isLoading: healthLoading } = useSystemHealth(5000);

  const isLoading = analyticsLoading || healthLoading;

  // Donut chart data
  const riskPieData = analytics
    ? [
        {
          name: "Safe",
          value: Number(analytics.greenCommands),
          color: RISK_COLORS.green,
        },
        {
          name: "Caution",
          value: Number(analytics.yellowCommands),
          color: RISK_COLORS.yellow,
        },
        {
          name: "Critical",
          value: Number(analytics.redCommands),
          color: RISK_COLORS.red,
        },
      ].filter((d) => d.value > 0)
    : [];

  // Bar chart data
  const outcomeBarData = analytics
    ? [
        {
          name: "Auto-allowed",
          value:
            Number(analytics.greenCommands) + Number(analytics.yellowCommands),
          fill: RISK_COLORS.green,
        },
        {
          name: "Approved",
          value: Number(analytics.approvedCommands),
          fill: RISK_COLORS.cyan,
        },
        {
          name: "Blocked",
          value: Number(analytics.blockedCommands),
          fill: RISK_COLORS.yellow,
        },
        {
          name: "Rejected",
          value: Number(analytics.rejectedCommands),
          fill: RISK_COLORS.red,
        },
      ]
    : [];

  const disastersPrevented = Number(analytics?.disastersPrevented ?? 0n);
  const pendingCount = Number(health?.pendingApprovals ?? 0n);

  return (
    <div
      data-ocid="analytics.page"
      className="flex-1 overflow-y-auto px-6 py-6 space-y-8"
    >
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            Analytics &amp; System Health
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time overview of AI governance activity
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-mono text-xs px-3 py-1"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
          Live
        </Badge>
      </div>

      {/* Section 1 — Key Metrics */}
      <section data-ocid="analytics.metrics.section">
        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
          Key Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <MetricsSkeleton count={4} />
          ) : (
            <>
              <MetricCard
                ocid="analytics.total_commands.card"
                label="Total Commands"
                value={Number(analytics?.totalCommands ?? 0n).toLocaleString()}
                subtext="All time intercepted"
                icon={<Activity size={18} />}
                accentClass="text-cyan-400"
              />

              {/* HERO: Disasters Prevented */}
              <Card
                data-ocid="analytics.disasters_prevented.card"
                className="relative overflow-hidden border-red-500/30 bg-card col-span-1 px-5 py-4 flex flex-col gap-2"
              >
                <div
                  className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 80% 20%, #ef4444 0%, transparent 70%)",
                  }}
                />
                <div className="flex items-center justify-between relative">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Disasters Prevented
                  </p>
                  <Shield size={18} className="text-red-400 opacity-80" />
                </div>
                <div className="relative">
                  <p className="text-3xl font-display font-bold text-red-400">
                    {disastersPrevented.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground relative">
                  Rejected + blocked critical actions
                </p>
              </Card>

              <MetricCard
                ocid="analytics.auto_executed.card"
                label="Auto-Executed"
                value={(
                  Number(analytics?.greenCommands ?? 0n) +
                  Number(analytics?.yellowCommands ?? 0n)
                ).toLocaleString()}
                subtext="Green + yellow commands"
                icon={<CheckCircle size={18} />}
                accentClass="text-emerald-400"
              />

              <MetricCard
                ocid="analytics.pending.card"
                label="Pending Right Now"
                value={pendingCount.toLocaleString()}
                subtext="Awaiting human review"
                icon={<AlertTriangle size={18} />}
                accentClass="text-amber-400"
                pulse
              />
            </>
          )}
        </div>
      </section>

      {/* Section 2 — Charts */}
      <section data-ocid="analytics.charts.section">
        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
          Risk Distribution
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Donut Chart */}
          <Card className="border-border bg-card p-5">
            <p className="font-display font-semibold text-sm text-foreground mb-4">
              Risk Level Ratio
            </p>
            {isLoading ? (
              <Skeleton className="h-56 w-full rounded-lg" />
            ) : riskPieData.length === 0 ? (
              <div className="h-56 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No command data yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={riskPieData}
                    dataKey="value"
                    innerRadius="55%"
                    outerRadius="75%"
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {riskPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                    {/* @ts-ignore */}
                    <DonutCenterLabel />
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      "Commands",
                    ]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "oklch(0.52 0 0)", fontSize: 12 }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Bar Chart: Outcomes */}
          <Card className="border-border bg-card p-5">
            <p className="font-display font-semibold text-sm text-foreground mb-4">
              Command Outcomes
            </p>
            {isLoading ? (
              <Skeleton className="h-56 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={outcomeBarData}
                  barSize={36}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "oklch(0.52 0 0)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.52 0 0)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: "oklch(0.22 0 0)" }}
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      "Commands",
                    ]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {outcomeBarData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </section>

      {/* Section 3 — System Health */}
      <section data-ocid="analytics.health.section">
        <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
          System Health
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {healthLoading ? (
            <MetricsSkeleton count={4} />
          ) : (
            <>
              <Card
                data-ocid="analytics.active_agents.card"
                className="border-border bg-card px-5 py-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Active Agents
                  </p>
                  <Zap size={16} className="text-cyan-400 opacity-70" />
                </div>
                <p className="text-3xl font-display font-bold text-cyan-400">
                  {Number(health?.activeAgents ?? 0n).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  AI agents connected
                </p>
              </Card>

              <Card
                data-ocid="analytics.requests_per_minute.card"
                className="border-border bg-card px-5 py-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Requests / min
                  </p>
                  <Activity size={16} className="text-primary opacity-70" />
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-display font-bold text-foreground">
                    {(health?.requestsPerMinute ?? 0).toFixed(1)}
                  </p>
                  <span className="mb-1 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-xs text-cyan-500 font-mono">
                      live
                    </span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Averaged over last minute
                </p>
              </Card>

              <Card
                data-ocid="analytics.pending_approvals.card"
                className="border-border bg-card px-5 py-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Pending Approvals
                  </p>
                  <AlertTriangle
                    size={16}
                    className="text-amber-400 opacity-70"
                  />
                </div>
                <p className="text-3xl font-display font-bold text-amber-400">
                  {Number(health?.pendingApprovals ?? 0n).toLocaleString()}
                </p>
                <Link
                  to="/dashboard"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                  data-ocid="analytics.dashboard.link"
                >
                  Review in dashboard →
                </Link>
              </Card>

              <Card
                data-ocid="analytics.uptime.card"
                className="border-border bg-card px-5 py-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Uptime
                  </p>
                  <Clock size={16} className="text-emerald-400 opacity-70" />
                </div>
                <p className="text-3xl font-display font-bold text-emerald-400">
                  {health ? formatUptime(health.uptime) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Since last deployment
                </p>
              </Card>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
