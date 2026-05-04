import CommonTypes "common";

module {
  public type Timestamp = CommonTypes.Timestamp;
  public type UserId = CommonTypes.UserId;

  public type RiskLevel = {
    #green;
    #yellow;
    #red;
  };

  public type CommandStatus = {
    #allowed;
    #blocked;
    #pending;
    #approved;
    #rejected;
  };

  public type UserRole = {
    #admin;
    #reviewer;
  };

  public type BlastRadius = {
    estimatedFiles : Nat;
    estimatedRows : Nat;
    severity : Text;
  };

  public type InterceptResult = {
    id : Text;
    status : { #allowed; #blocked; #pending };
    riskLevel : RiskLevel;
    reason : Text;
    blastRadius : ?BlastRadius;
  };

  public type ApprovalResult = {
    success : Bool;
    message : Text;
  };

  public type LogFilter = {
    status : ?Text;
    riskLevel : ?Text;
    agentId : ?Text;
    limit : ?Nat;
  };

  public type CommandLog = {
    id : Text;
    command : Text;
    agentId : Text;
    commandType : Text;
    riskLevel : RiskLevel;
    status : CommandStatus;
    timestamp : Timestamp;
    approverId : ?Text;
    approverReason : ?Text;
    blastRadius : ?BlastRadius;
  };

  public type Analytics = {
    totalCommands : Nat;
    greenCommands : Nat;
    yellowCommands : Nat;
    redCommands : Nat;
    approvedCommands : Nat;
    rejectedCommands : Nat;
    blockedCommands : Nat;
    disastersPrevented : Nat;
    activeAgents : Nat;
    requestsPerMinute : Float;
  };

  public type SystemHealth = {
    activeAgents : Nat;
    requestsPerMinute : Float;
    pendingApprovals : Nat;
    uptime : Int;
  };

  // Internal mutable state type (not shared across API boundary)
  public type CommandLogInternal = {
    id : Text;
    command : Text;
    agentId : Text;
    commandType : Text;
    riskLevel : RiskLevel;
    var status : CommandStatus;
    timestamp : Timestamp;
    var approverId : ?Text;
    var approverReason : ?Text;
    blastRadius : ?BlastRadius;
  };
}
