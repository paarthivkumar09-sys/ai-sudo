import Time "mo:core/Time";
import Text "mo:core/Text";
import Types "../types/gateway";

module {

  // ── Pattern helpers ────────────────────────────────────────────────────────

  func containsAny(cmd : Text, patterns : [Text]) : Bool {
    let lower = cmd.toLower();
    for (p in patterns.values()) {
      if (lower.contains(#text p)) return true;
    };
    false;
  };

  func startsWithRootPath(cmd : Text) : Bool {
    let t = cmd.trimStart(#char ' ');
    t.startsWith(#text "/") or t.startsWith(#text "C:\\") or t.startsWith(#text "D:\\");
  };

  func hasDangerousFlag(cmd : Text) : Bool {
    let lower = cmd.toLower();
    lower.contains(#text "-rf") or lower.contains(#text " -y") or
    lower.contains(#text "/q") or lower.contains(#text "--force") or
    lower.contains(#text "-f /");
  };

  func hasDeleteWithoutWhere(cmd : Text) : Bool {
    let lower = cmd.toLower();
    lower.contains(#text "delete from") and not lower.contains(#text "where");
  };

  let greenPatterns : [Text] = [
    "ls", "git status", "git log", "git diff", "pwd", "cat ", "head ",
    "tail ", "echo ", "read_file", "get_", "select ", "npm start",
    "npm run dev", "ping",
  ];

  let yellowPatterns : [Text] = [
    "write_file", "update_file", "create_table", "alter_table",
    "insert_into", "insert into", "npm install", "git commit", "git push",
    "mkdir", "touch ", "cp ", "mv ",
  ];

  let redPatterns : [Text] = [
    "rm -rf", "rmdir", "delete from", "drop table", "truncate", "format",
    "fdisk", "mkfs", "dd if=", "shutdown", "reboot", "kill -9",
    "chmod 777", "chown", "passwd", "drop database", "grant all",
  ];

  // ── Public functions ───────────────────────────────────────────────────────

  /// Classify a command and determine its risk level
  public func classifyRisk(command : Text, commandType : Text) : Types.RiskLevel {
    let lower = command.toLower();
    // RED: explicit red patterns
    if (containsAny(lower, redPatterns)) return #red;
    // RED: root path
    if (startsWithRootPath(command)) return #red;
    // RED: dangerous flags
    if (hasDangerousFlag(lower)) return #red;
    // RED: DELETE FROM without WHERE
    if (hasDeleteWithoutWhere(lower)) return #red;
    // YELLOW
    if (containsAny(lower, yellowPatterns)) return #yellow;
    // GREEN: explicit green patterns or default safe
    if (containsAny(lower, greenPatterns)) return #green;
    // Default: treat unknown as yellow (safe-ish but not auto)
    #yellow;
  };

  /// Estimate blast radius for red-level commands
  public func estimateBlastRadius(command : Text, commandType : Text) : ?Types.BlastRadius {
    let lower = command.toLower();
    if (lower.contains(#text "format") or lower.contains(#text "fdisk")) {
      return ?{ estimatedFiles = 99999; estimatedRows = 0; severity = "CATASTROPHIC - System destruction" };
    };
    if (lower.contains(#text "drop database") or lower.contains(#text "drop table")) {
      return ?{ estimatedFiles = 1; estimatedRows = 9999; severity = "CRITICAL - Schema destruction" };
    };
    if (lower.contains(#text "delete from") or lower.contains(#text "truncate")) {
      return ?{ estimatedFiles = 0; estimatedRows = 1000; severity = "CRITICAL - Data loss" };
    };
    if (lower.contains(#text "rm") or lower.contains(#text "rmdir")) {
      return ?{ estimatedFiles = 50; estimatedRows = 0; severity = "HIGH - File deletion" };
    };
    null;
  };

  /// Generate a unique command ID from timestamp + counter
  public func generateId(counter : Nat) : Text {
    let ts = Time.now();
    "cmd-" # ts.toText() # "-" # counter.toText();
  };

  /// Map risk level to execution status
  public func autoDecide(riskLevel : Types.RiskLevel) : { #allowed; #blocked; #pending } {
    switch (riskLevel) {
      case (#green) #allowed;
      case (#yellow) #allowed;
      case (#red) #pending;
    };
  };

  /// Build a human-readable reason string
  func buildReason(riskLevel : Types.RiskLevel, status : { #allowed; #blocked; #pending }) : Text {
    switch (riskLevel) {
      case (#green) "Command classified as safe — auto-executing";
      case (#yellow) "Command requires caution — executing with warning";
      case (#red) "High-risk command detected — awaiting human approval";
    };
  };

  /// Build an InterceptResult from classification
  public func buildInterceptResult(
    id : Text,
    command : Text,
    commandType : Text,
    riskLevel : Types.RiskLevel,
    status : { #allowed; #blocked; #pending },
    blastRadius : ?Types.BlastRadius,
  ) : Types.InterceptResult {
    { id; status; riskLevel; reason = buildReason(riskLevel, status); blastRadius };
  };

  /// Convert internal mutable log to immutable shared CommandLog
  public func toPublicLog(internal : Types.CommandLogInternal) : Types.CommandLog {
    {
      id = internal.id;
      command = internal.command;
      agentId = internal.agentId;
      commandType = internal.commandType;
      riskLevel = internal.riskLevel;
      status = internal.status;
      timestamp = internal.timestamp;
      approverId = internal.approverId;
      approverReason = internal.approverReason;
      blastRadius = internal.blastRadius;
    };
  };

  /// Apply log filter to a list of command logs
  public func applyFilter(logs : [Types.CommandLog], filter : ?Types.LogFilter) : [Types.CommandLog] {
    switch (filter) {
      case null logs;
      case (?f) {
        var result = logs;
        // Filter by status
        switch (f.status) {
          case null {};
          case (?s) {
            result := result.filter(func(l) {
              switch (l.status) {
                case (#allowed) s == "allowed";
                case (#blocked) s == "blocked";
                case (#pending) s == "pending";
                case (#approved) s == "approved";
                case (#rejected) s == "rejected";
              };
            });
          };
        };
        // Filter by riskLevel
        switch (f.riskLevel) {
          case null {};
          case (?r) {
            result := result.filter(func(l) {
              switch (l.riskLevel) {
                case (#green) r == "green";
                case (#yellow) r == "yellow";
                case (#red) r == "red";
              };
            });
          };
        };
        // Filter by agentId
        switch (f.agentId) {
          case null {};
          case (?a) {
            result := result.filter(func(l) { l.agentId == a });
          };
        };
        // Apply limit
        switch (f.limit) {
          case null result;
          case (?lim) {
            let size = result.size();
            if (lim >= size) result
            else result.sliceToArray(0, lim.toInt());
          };
        };
      };
    };
  };

  /// Compute analytics from command logs
  public func computeAnalytics(logs : [Types.CommandLog], agentSet : [Text], startTime : Int) : Types.Analytics {
    var green = 0;
    var yellow = 0;
    var red = 0;
    var approved = 0;
    var rejected = 0;
    var blocked = 0;
    for (l in logs.values()) {
      switch (l.riskLevel) {
        case (#green) green += 1;
        case (#yellow) yellow += 1;
        case (#red) red += 1;
      };
      switch (l.status) {
        case (#approved) approved += 1;
        case (#rejected) rejected += 1;
        case (#blocked) blocked += 1;
        case _ {};
      };
    };
    let total = logs.size();
    let uptimeSecs = (Time.now() - startTime) / 1_000_000_000;
    let rpm : Float = if (uptimeSecs <= 0) 0.0
      else total.toFloat() / (uptimeSecs.toFloat() / 60.0);
    {
      totalCommands = total;
      greenCommands = green;
      yellowCommands = yellow;
      redCommands = red;
      approvedCommands = approved;
      rejectedCommands = rejected;
      blockedCommands = blocked;
      disastersPrevented = rejected + blocked;
      activeAgents = agentSet.size();
      requestsPerMinute = rpm;
    };
  };

  /// Compute system health metrics
  public func computeHealth(logs : [Types.CommandLog], agentSet : [Text], startTime : Int) : Types.SystemHealth {
    var pending = 0;
    let now = Time.now();
    let oneMinuteAgo = now - 60_000_000_000;
    var recentCount = 0;
    for (l in logs.values()) {
      if (l.status == #pending) pending += 1;
      if (l.timestamp >= oneMinuteAgo) recentCount += 1;
    };
    let uptimeSecs = (now - startTime) / 1_000_000_000;
    let rpm : Float = recentCount.toFloat();
    {
      activeAgents = agentSet.size();
      requestsPerMinute = rpm;
      pendingApprovals = pending;
      uptime = uptimeSecs;
    };
  };
}
