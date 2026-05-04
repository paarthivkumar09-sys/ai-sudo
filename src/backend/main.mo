import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import GatewayTypes "types/gateway";
import GatewayApi "mixins/gateway-api";

actor {
  let logs = List.empty<GatewayTypes.CommandLogInternal>();
  let roles = Map.empty<Text, GatewayTypes.UserRole>();
  let commandCounter = { var value : Nat = 0 };
  let startTime : Int = Time.now();

  include GatewayApi(logs, roles, commandCounter, startTime);
}
