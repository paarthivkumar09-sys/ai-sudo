import { type InterceptResult, createActor } from "@/backend";
import type {
  Analytics,
  ApprovalResult,
  CommandLog,
  LogFilter,
  SystemHealth,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, isFetching };
}

export function usePendingApprovals(intervalMs = 5000) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CommandLog[]>({
    queryKey: ["pendingApprovals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingApprovals();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: intervalMs,
    staleTime: 2000,
  });
}

export function useCommandLogs(filter?: LogFilter, intervalMs?: number) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CommandLog[]>({
    queryKey: ["commandLogs", filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLogs(filter ?? null);
    },
    enabled: !!actor && !isFetching,
    staleTime: 5000,
    refetchInterval: intervalMs,
  });
}

export function useAnalytics(intervalMs = 10000) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: intervalMs,
    staleTime: 5000,
  });
}

export function useSystemHealth(intervalMs = 5000) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SystemHealth>({
    queryKey: ["systemHealth"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getSystemHealth();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: intervalMs,
    staleTime: 2000,
  });
}

export function useApprove() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    ApprovalResult,
    Error,
    { commandId: string; decision: boolean; callerId: string; reason?: string }
  >({
    mutationFn: async ({ commandId, decision, callerId, reason }) => {
      if (!actor) throw new Error("No actor");
      return actor.approve(commandId, decision, callerId, reason ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["commandLogs"] });
      queryClient.invalidateQueries({ queryKey: ["systemHealth"] });
    },
  });
}

export function useMyRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["myRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}
export function useIntercept() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    InterceptResult,
    Error,
    { command: string; agentId: string; commandType: string }
  >({
    mutationFn: async ({ command, agentId, commandType }) => {
      if (!actor) throw new Error("No actor");
      return actor.intercept(command, agentId, commandType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["commandLogs"] });
      queryClient.invalidateQueries({ queryKey: ["systemHealth"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
