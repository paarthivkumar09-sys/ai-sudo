import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/gateway";
import GatewayLib "../lib/gateway";

mixin (
  logs : List.List<Types.CommandLogInternal>,
  roles : Map.Map<Text, Types.UserRole>,
  commandCounter : { var value : Nat },
  startTime : Int,
) {

  // agents: agentId -> last seen timestamp (Text key for simplicity)
  let agents = Map.empty<Text, Int>();

  /// Intercept a command from an AI agent, classify risk, and decide action.
  public shared func intercept(command : Text, agentId : Text, commandType : Text) : async Types.InterceptResult {
    commandCounter.value += 1;
    let id = GatewayLib.generateId(commandCounter.value);
    let riskLevel = GatewayLib.classifyRisk(command, commandType);
    let blastRadius = if (riskLevel == #red) GatewayLib.estimateBlastRadius(command, commandType) else null;
    let status = GatewayLib.autoDecide(riskLevel);
    // Track agent
    agents.add(agentId, Time.now());
    // Append log
    let entry : Types.CommandLogInternal = {
      id;
      command;
      agentId;
      commandType;
      riskLevel;
      var status;
      timestamp = Time.now();
      var approverId = null;
      var approverReason = null;
      blastRadius;
    };
    logs.add(entry);
    GatewayLib.buildInterceptResult(id, command, commandType, riskLevel, status, blastRadius);
  };

  /// Approve or reject a pending command by its ID.
  public shared ({ caller }) func approve(commandId : Text, decision : Bool, callerId : Text, reason : ?Text) : async Types.ApprovalResult {
    let found = logs.find(func(l) { l.id == commandId });
    switch (found) {
      case null { { success = false; message = "Command not found: " # commandId } };
      case (?entry) {
        if (entry.status != #pending) {
          return { success = false; message = "Command is not pending approval" };
        };
        entry.status := if (decision) #approved else #rejected;
        entry.approverId := ?callerId;
        entry.approverReason := reason;
        let action = if (decision) "approved" else "rejected";
        { success = true; message = "Command " # commandId # " has been " # action };
      };
    };
  };

  /// Retrieve command logs, optionally filtered.
  public query func getLogs(filter : ?Types.LogFilter) : async [Types.CommandLog] {
    let allLogs = logs.map<Types.CommandLogInternal, Types.CommandLog>(func(l) { GatewayLib.toPublicLog(l) }).toArray();
    GatewayLib.applyFilter(allLogs, filter);
  };

  /// Retrieve aggregated analytics across all commands.
  public query func getAnalytics() : async Types.Analytics {
    let allLogs = logs.map<Types.CommandLogInternal, Types.CommandLog>(func(l) { GatewayLib.toPublicLog(l) }).toArray();
    let agentIds = agents.keys().toArray();
    GatewayLib.computeAnalytics(allLogs, agentIds, startTime);
  };

  /// Retrieve current system health metrics.
  public query func getSystemHealth() : async Types.SystemHealth {
    let allLogs = logs.map<Types.CommandLogInternal, Types.CommandLog>(func(l) { GatewayLib.toPublicLog(l) }).toArray();
    let agentIds = agents.keys().toArray();
    GatewayLib.computeHealth(allLogs, agentIds, startTime);
  };

  /// Retrieve all commands currently awaiting human approval.
  public query func getPendingApprovals() : async [Types.CommandLog] {
    logs.filter(func(l) { l.status == #pending })
        .map<Types.CommandLogInternal, Types.CommandLog>(func(l) { GatewayLib.toPublicLog(l) })
        .toArray();
  };

  /// Assign a role to a user (admin only).
  public shared ({ caller }) func setUserRole(userId : Text, role : Types.UserRole) : async Bool {
    let callerRole = roles.get(caller.toText());
    switch (callerRole) {
      case (?(#admin)) {
        roles.add(userId, role);
        true;
      };
      case _ {
        // Bootstrap: if no roles exist yet, allow first call to set admin
        if (roles.size() == 0) {
          roles.add(userId, role);
          true;
        } else {
          false;
        };
      };
    };
  };

  /// Return the role of the calling user.
  public query ({ caller }) func getMyRole() : async ?Types.UserRole {
    roles.get(caller.toText());
  };
}
