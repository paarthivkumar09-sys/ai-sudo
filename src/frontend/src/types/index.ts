import type {
  Analytics,
  ApprovalResult,
  BlastRadius,
  CommandLog,
  CommandStatus,
  InterceptResult,
  LogFilter,
  RiskLevel,
  SystemHealth,
  UserRole,
} from "@/backend";

export type {
  CommandStatus,
  RiskLevel,
  UserRole,
  BlastRadius,
  Analytics,
  SystemHealth,
  InterceptResult,
  ApprovalResult,
  LogFilter,
  CommandLog,
};

export interface ApprovalDecision {
  commandId: string;
  decision: boolean;
  callerId: string;
  reason?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
