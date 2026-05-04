import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BlastRadius {
    estimatedFiles: bigint;
    severity: string;
    estimatedRows: bigint;
}
export type Timestamp = bigint;
export interface CommandLog {
    id: string;
    status: CommandStatus;
    approverId?: string;
    approverReason?: string;
    agentId: string;
    command: string;
    timestamp: Timestamp;
    blastRadius?: BlastRadius;
    riskLevel: RiskLevel;
    commandType: string;
}
export interface Analytics {
    disastersPrevented: bigint;
    redCommands: bigint;
    greenCommands: bigint;
    rejectedCommands: bigint;
    blockedCommands: bigint;
    approvedCommands: bigint;
    yellowCommands: bigint;
    activeAgents: bigint;
    totalCommands: bigint;
    requestsPerMinute: number;
}
export interface SystemHealth {
    pendingApprovals: bigint;
    uptime: bigint;
    activeAgents: bigint;
    requestsPerMinute: number;
}
export interface LogFilter {
    status?: string;
    agentId?: string;
    limit?: bigint;
    riskLevel?: string;
}
export interface InterceptResult {
    id: string;
    status: Variant_pending_blocked_allowed;
    blastRadius?: BlastRadius;
    riskLevel: RiskLevel;
    reason: string;
}
export interface ApprovalResult {
    message: string;
    success: boolean;
}
export enum CommandStatus {
    pending = "pending",
    blocked = "blocked",
    allowed = "allowed",
    approved = "approved",
    rejected = "rejected"
}
export enum RiskLevel {
    red = "red",
    green = "green",
    yellow = "yellow"
}
export enum UserRole {
    admin = "admin",
    reviewer = "reviewer"
}
export enum Variant_pending_blocked_allowed {
    pending = "pending",
    blocked = "blocked",
    allowed = "allowed"
}
export interface backendInterface {
    approve(commandId: string, decision: boolean, callerId: string, reason: string | null): Promise<ApprovalResult>;
    getAnalytics(): Promise<Analytics>;
    getLogs(filter: LogFilter | null): Promise<Array<CommandLog>>;
    getMyRole(): Promise<UserRole | null>;
    getPendingApprovals(): Promise<Array<CommandLog>>;
    getSystemHealth(): Promise<SystemHealth>;
    intercept(command: string, agentId: string, commandType: string): Promise<InterceptResult>;
    setUserRole(userId: string, role: UserRole): Promise<boolean>;
}
