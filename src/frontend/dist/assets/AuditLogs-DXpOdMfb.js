import { c as createLucideIcon, j as jsxRuntimeExports, a as cn, r as reactExports, S as Skeleton, C as ChevronRight } from "./index-Ai3gszGZ.js";
import { b as CircleX, X, C as ChevronDown, a as Check } from "./x-CGzDf8Yd.js";
import { T as TriangleAlert, Z as Zap } from "./zap-BaR_EMsK.js";
import { C as CircleCheckBig } from "./circle-check-big-qqmZa5sl.js";
import { d as useCommandLogs } from "./use-backend-Cq3ihEoA.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
      key: "sc7q7i"
    }
  ]
];
const Funnel = createLucideIcon("funnel", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M7 12h10", key: "b7w52i" }],
  ["path", { d: "M10 18h4", key: "1ulq68" }]
];
const ListFilter = createLucideIcon("list-filter", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode);
const CONFIG = {
  green: {
    label: "SAFE",
    icon: CircleCheckBig,
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
  },
  yellow: {
    label: "CAUTION",
    icon: TriangleAlert,
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/30"
  },
  red: {
    label: "CRITICAL",
    icon: CircleX,
    classes: "bg-red-500/15 text-red-400 border-red-500/30"
  }
};
const SIZE_CLASSES = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2"
};
const ICON_SIZE = {
  sm: 10,
  md: 12,
  lg: 14
};
function RiskBadge({ level, size = "md", className }) {
  const config = CONFIG[level];
  const Icon = config.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center font-mono font-bold uppercase tracking-widest rounded border",
        config.classes,
        SIZE_CLASSES[size],
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: ICON_SIZE[size], strokeWidth: 2.5 }),
        config.label
      ]
    }
  );
}
const STATUS_CONFIG = {
  allowed: {
    label: "ALLOWED",
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
  },
  blocked: {
    label: "BLOCKED",
    classes: "bg-red-500/15 text-red-400 border-red-500/30"
  },
  pending: {
    label: "PENDING",
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    pulse: true
  },
  approved: {
    label: "APPROVED",
    classes: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
  },
  rejected: {
    label: "REJECTED",
    classes: "bg-muted text-muted-foreground border-border"
  }
};
function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.blocked;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center font-mono font-bold uppercase tracking-widest text-[10px] px-1.5 py-0.5 rounded border",
        config.classes,
        config.pulse && "animate-pulse",
        className
      ),
      children: config.label
    }
  );
}
const DATE_RANGE_OPTIONS = [
  { value: "1h", label: "Last 1h" },
  { value: "6h", label: "Last 6h" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" }
];
const RISK_OPTIONS = [
  { value: "all", label: "All Risks" },
  { value: "green", label: "GREEN" },
  { value: "yellow", label: "YELLOW" },
  { value: "red", label: "RED" }
];
const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "allowed", label: "Allowed" },
  { value: "blocked", label: "Blocked" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];
function toMs(ts) {
  return Number(ts / 1000000n);
}
function relativeTime(ts) {
  const diffS = Math.floor((Date.now() - toMs(ts)) / 1e3);
  if (diffS < 5) return "just now";
  if (diffS < 60) return `${diffS}s ago`;
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m ago`;
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h ago`;
  return `${Math.floor(diffS / 86400)}d ago`;
}
function fullTimestamp(ts) {
  return new Date(toMs(ts)).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}
function dateRangeCutoff(range) {
  const MS = {
    "1h": 36e5,
    "6h": 216e5,
    "24h": 864e5,
    "7d": 6048e5
  };
  return Date.now() - MS[range];
}
function CopyButton({ text }) {
  const [copied, setCopied] = reactExports.useState(false);
  const copy = reactExports.useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: (e) => {
        e.stopPropagation();
        void copy();
      },
      className: "p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
      "aria-label": "Copy command",
      children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12, className: "text-emerald-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 12 })
    }
  );
}
function BlastRadiusBlock({ log }) {
  const br = Array.isArray(log.blastRadius) ? log.blastRadius[0] : log.blastRadius;
  if (!br) return null;
  const severityColor = br.severity.toLowerCase() === "critical" ? "text-red-400 border-red-500/30 bg-red-500/10" : br.severity.toLowerCase() === "high" ? "text-orange-400 border-orange-500/30 bg-orange-500/10" : "text-amber-400 border-amber-500/30 bg-amber-500/10";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex items-center gap-2 rounded-md border px-3 py-2",
        severityColor
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12, className: "shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs", children: [
          "Blast Radius — ",
          br.severity.toUpperCase(),
          ": ~",
          Number(br.estimatedFiles),
          " ",
          "files, ~",
          Number(br.estimatedRows),
          " rows"
        ] })
      ]
    }
  );
}
function ExpandedRow({ log }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 pt-1 space-y-3 border-t border-border/50 bg-muted/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground uppercase tracking-wider", children: "Full Command" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 font-mono text-xs text-foreground bg-background rounded border border-border px-3 py-2 break-all", children: log.command }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: log.command })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BlastRadiusBlock, { log }),
    log.approverId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Approver: " }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-foreground", children: log.approverId })
      ] }),
      log.approverReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Reason: " }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/80 italic", children: [
          '"',
          log.approverReason,
          '"'
        ] })
      ] })
    ] })
  ] });
}
function LogRow({
  log,
  index,
  expanded,
  onToggle
}) {
  const cmdPreview = log.command.length > 60 ? `${log.command.slice(0, 60)}...` : log.command;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "tr",
      {
        "data-ocid": `logs.item.${index + 1}`,
        onClick: onToggle,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        },
        tabIndex: 0,
        className: cn(
          "cursor-pointer transition-colors hover:bg-muted/40",
          expanded && "bg-muted/30"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "td",
            {
              className: "px-4 py-3 whitespace-nowrap",
              title: fullTimestamp(log.timestamp),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: relativeTime(log.timestamp) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-foreground/80 truncate max-w-[120px] block", children: log.agentId }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono text-xs text-foreground truncate max-w-[280px]", children: cmdPreview }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: log.command })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { level: log.riskLevel, size: "sm" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: log.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: log.approverId ?? "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right", children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14, className: "text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, className: "text-muted-foreground" }) })
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandedRow, { log }) }) })
  ] });
}
function SkeletonRows() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: [1, 2, 3, 4, 5, 6, 7].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-16" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-48" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16 rounded" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16 rounded" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4 rounded" }) })
  ] }, i)) });
}
function FilterSelect({
  value,
  onChange,
  options,
  ocid
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "select",
    {
      "data-ocid": ocid,
      value,
      onChange: (e) => onChange(e.target.value),
      className: "h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer",
      children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.value, children: o.label }, o.value))
    }
  );
}
function AuditLogs() {
  const [search, setSearch] = reactExports.useState("");
  const [riskFilter, setRiskFilter] = reactExports.useState("all");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [dateRange, setDateRange] = reactExports.useState("24h");
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const { data: logs, isLoading } = useCommandLogs(void 0, 1e4);
  const hasFilters = search || riskFilter !== "all" || statusFilter !== "all" || dateRange !== "24h";
  const clearFilters = () => {
    setSearch("");
    setRiskFilter("all");
    setStatusFilter("all");
    setDateRange("24h");
  };
  const filtered = reactExports.useMemo(() => {
    if (!logs) return [];
    const cutoff = dateRangeCutoff(dateRange);
    return logs.filter((l) => toMs(l.timestamp) >= cutoff).filter((l) => riskFilter === "all" || String(l.riskLevel) === riskFilter).filter(
      (l) => statusFilter === "all" || String(l.status) === statusFilter
    ).filter((l) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return l.command.toLowerCase().includes(q) || l.agentId.toLowerCase().includes(q);
    }).sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [logs, riskFilter, statusFilter, dateRange, search]);
  const totalInSystem = (logs == null ? void 0 : logs.length) ?? 0;
  const toggleExpand = (id) => setExpandedId((prev) => prev === id ? null : id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-10 bg-card border-b border-border px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10 border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListFilter, { size: 16, className: "text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-lg font-bold text-foreground leading-tight", children: "Audit Logs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Complete record of all AI agent commands" })
          ] })
        ] }),
        !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground font-mono", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-semibold", children: filtered.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "shown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-border", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-semibold", children: totalInSystem }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "total" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Search,
            {
              size: 12,
              className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              "data-ocid": "logs.search_input",
              type: "text",
              placeholder: "Search commands, agents…",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "h-8 pl-7 pr-3 rounded-md border border-input bg-background text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-52"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FilterSelect,
          {
            value: riskFilter,
            onChange: setRiskFilter,
            options: RISK_OPTIONS,
            ocid: "logs.risk_filter"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FilterSelect,
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: STATUS_OPTIONS,
            ocid: "logs.status_filter"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FilterSelect,
          {
            value: dateRange,
            onChange: (v) => setDateRange(v),
            options: DATE_RANGE_OPTIONS,
            ocid: "logs.date_range_filter"
          }
        ),
        hasFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "data-ocid": "logs.clear_filters_button",
            onClick: clearFilters,
            className: "h-8 flex items-center gap-1.5 px-2.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }),
              "Clear"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/40 border-b border-border", children: [
          "Time",
          "Agent",
          "Command",
          "Risk",
          "Status",
          "Approver",
          ""
        ].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "th",
          {
            className: "px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap",
            children: col
          },
          col
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonRows, {}) : filtered.length > 0 ? filtered.map((log, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          LogRow,
          {
            log,
            index: i,
            expanded: expandedId === log.id,
            onToggle: () => toggleExpand(log.id)
          },
          log.id
        )) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "logs.empty_state",
            className: "py-16 flex flex-col items-center gap-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-full bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 24, className: "text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground", children: "No commands match your filters" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: hasFilters ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Try adjusting filters or",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: clearFilters,
                    className: "underline hover:text-foreground transition-colors",
                    children: "clear them"
                  }
                )
              ] }) : "No commands have been logged yet." })
            ]
          }
        ) }) }) })
      ] }) }) }),
      !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5 mt-3 text-[11px] text-muted-foreground/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Auto-refreshes every 10 seconds" })
      ] })
    ] })
  ] });
}
export {
  AuditLogs as default
};
