import type { backendInterface } from "../backend";
import { CommandStatus, RiskLevel, UserRole, Variant_pending_blocked_allowed } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);

// In-memory list of pending approvals (starts with demo data, simulator adds to it)
const pendingQueue: Array<{
  id: string;
  status: typeof CommandStatus.pending;
  agentId: string;
  command: string;
  timestamp: bigint;
  blastRadius?: {
    estimatedFiles: bigint;
    estimatedRows: bigint;
    severity: string;
  };
  riskLevel: typeof RiskLevel.red | typeof RiskLevel.yellow;
  commandType: string;
}> = [
  {
    id: "cmd-pending-001",
    status: CommandStatus.pending,
    agentId: "agent-cursor-01",
    command: "rm -rf ./node_modules && npm install --legacy-peer-deps",
    timestamp: now - BigInt(120 * 1_000_000_000),
    blastRadius: { estimatedFiles: BigInt(48000), severity: "high", estimatedRows: BigInt(0) },
    riskLevel: RiskLevel.red,
    commandType: "shell",
  },
  {
    id: "cmd-pending-002",
    status: CommandStatus.pending,
    agentId: "agent-gpt-02",
    command: "TRUNCATE TABLE audit_logs",
    timestamp: now - BigInt(240 * 1_000_000_000),
    blastRadius: { estimatedFiles: BigInt(0), severity: "critical", estimatedRows: BigInt(89000) },
    riskLevel: RiskLevel.red,
    commandType: "sql",
  },
  {
    id: "cmd-pending-003",
    status: CommandStatus.pending,
    agentId: "agent-claude-03",
    command: "write_file('/etc/nginx/nginx.conf', newConfig)",
    timestamp: now - BigInt(60 * 1_000_000_000),
    blastRadius: { estimatedFiles: BigInt(1), severity: "moderate", estimatedRows: BigInt(0) },
    riskLevel: RiskLevel.yellow,
    commandType: "file_write",
  },
];

// Risk classification helpers
const RED_PATTERNS = [
  /rm\s+-rf/i, /drop\s+table/i, /truncate/i, /format\s*[c-z]:/i,
  /fdisk/i, /mkfs/i, /\bDELETE\s+FROM\b.*WHERE\s+1=1/i,
  /\bDELETE\s+FROM\b[^;]*$/i, /shutdown/i, /reboot/i,
  /\/dev\/sd/i, /wipefs/i,
];

const YELLOW_PATTERNS = [
  /npm\s+install/i, /git\s+commit/i, /git\s+push/i, /git\s+merge/i,
  /write_file/i, /update_file/i, /mkdir/i, /mv\s+/i, /cp\s+-r/i,
  /UPDATE\s+\w/i, /INSERT\s+INTO/i, /CREATE\s+TABLE/i, /ALTER\s+TABLE/i,
  /chmod/i, /chown/i, /sudo/i,
];

function classifyCommand(command: string): { risk: "green" | "yellow" | "red"; reason: string; blastRadius?: { estimatedFiles: bigint; estimatedRows: bigint; severity: string } } {
  const cmd = command.trim();

  // Check RED patterns
  if (RED_PATTERNS.some((p) => p.test(cmd))) {
    let severity = "critical";
    let estimatedFiles = BigInt(0);
    let estimatedRows = BigInt(0);

    if (/rm\s+-rf/i.test(cmd) || /fdisk/i.test(cmd) || /mkfs/i.test(cmd)) {
      severity = "critical";
      estimatedFiles = BigInt(Math.floor(Math.random() * 50000) + 1000);
    } else if (/truncate/i.test(cmd) || /drop\s+table/i.test(cmd)) {
      severity = "critical";
      estimatedRows = BigInt(Math.floor(Math.random() * 100000) + 10000);
    } else if (/delete\s+from/i.test(cmd)) {
      severity = "high";
      estimatedRows = BigInt(Math.floor(Math.random() * 10000) + 100);
    }

    return {
      risk: "red",
      reason: `Classified RED: destructive or irreversible operation detected.`,
      blastRadius: { estimatedFiles, estimatedRows, severity },
    };
  }

  // Check YELLOW patterns
  if (YELLOW_PATTERNS.some((p) => p.test(cmd))) {
    return {
      risk: "yellow",
      reason: `Classified YELLOW: modifying operation — auto-executed with caution.`,
    };
  }

  // GREEN
  return { risk: "green", reason: "Classified GREEN: read-only or safe operation — auto-executed." };
}

export const mockBackend: backendInterface = {
  approve: async (commandId, decision, _callerId, _reason) => {
    // Remove from pending queue when approved or rejected
    const idx = pendingQueue.findIndex((c) => c.id === commandId);
    if (idx !== -1) pendingQueue.splice(idx, 1);
    return { message: "Decision recorded successfully", success: true };
  },

  getAnalytics: async () => ({
    disastersPrevented: BigInt(42),
    redCommands: BigInt(18),
    greenCommands: BigInt(134),
    rejectedCommands: BigInt(11),
    blockedCommands: BigInt(7),
    approvedCommands: BigInt(15),
    yellowCommands: BigInt(56),
    activeAgents: BigInt(5),
    totalCommands: BigInt(208),
    requestsPerMinute: 12.4,
  }),

  getLogs: async (_filter) => [
    {
      id: "log-001",
      status: CommandStatus.approved,
      approverId: "user-admin-1",
      approverReason: "Verified safe operation",
      agentId: "agent-cursor-01",
      command: "git status",
      timestamp: now - BigInt(3600 * 1_000_000_000),
      riskLevel: RiskLevel.green,
      commandType: "shell",
    },
    {
      id: "log-002",
      status: CommandStatus.rejected,
      approverId: "user-admin-1",
      approverReason: "Unauthorized deletion attempt",
      agentId: "agent-gpt-02",
      command: "rm -rf /var/data/production",
      timestamp: now - BigInt(7200 * 1_000_000_000),
      blastRadius: {
        estimatedFiles: BigInt(2400),
        severity: "critical",
        estimatedRows: BigInt(0),
      },
      riskLevel: RiskLevel.red,
      commandType: "shell",
    },
    {
      id: "log-003",
      status: CommandStatus.allowed,
      agentId: "agent-cursor-01",
      command: "npm run build",
      timestamp: now - BigInt(1800 * 1_000_000_000),
      riskLevel: RiskLevel.green,
      commandType: "shell",
    },
    {
      id: "log-004",
      status: CommandStatus.blocked,
      agentId: "agent-gpt-02",
      command: "DROP TABLE users",
      timestamp: now - BigInt(900 * 1_000_000_000),
      blastRadius: {
        estimatedFiles: BigInt(0),
        severity: "critical",
        estimatedRows: BigInt(150000),
      },
      riskLevel: RiskLevel.red,
      commandType: "sql",
    },
    {
      id: "log-005",
      status: CommandStatus.pending,
      agentId: "agent-claude-03",
      command: "UPDATE users SET plan='enterprise' WHERE id=42",
      timestamp: now - BigInt(300 * 1_000_000_000),
      blastRadius: {
        estimatedFiles: BigInt(0),
        severity: "moderate",
        estimatedRows: BigInt(1),
      },
      riskLevel: RiskLevel.yellow,
      commandType: "sql",
    },
  ],

  getMyRole: async () => UserRole.admin,

  getPendingApprovals: async () => pendingQueue as unknown as import("@/backend").CommandLog[],


  getSystemHealth: async () => ({
    pendingApprovals: BigInt(3),
    uptime: BigInt(99940),
    activeAgents: BigInt(5),
    requestsPerMinute: 12.4,
  }),

  intercept: async (command, agentId, commandType) => {
    const classification = classifyCommand(command);
    const id = `cmd-sim-${Date.now()}`;

    if (classification.risk === "red") {
      // Add to pending queue so it appears in the approval dashboard
      pendingQueue.unshift({
        id,
        status: CommandStatus.pending,
        agentId,
        command,
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
        blastRadius: classification.blastRadius,
        riskLevel: RiskLevel.red,
        commandType,
      });
      return {
        id,
        status: Variant_pending_blocked_allowed.pending,
        riskLevel: RiskLevel.red,
        reason: classification.reason,
        blastRadius: classification.blastRadius,
      };
    }

    return {
      id,
      status: Variant_pending_blocked_allowed.allowed,
      riskLevel: classification.risk === "yellow" ? RiskLevel.yellow : RiskLevel.green,
      reason: classification.reason,
    };
  },

  setUserRole: async (_userId, _role) => true,
};
