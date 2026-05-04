import { UserRole } from "@/backend";
import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyRole } from "@/hooks/use-backend";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Settings as SettingsIcon, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { data: myRole, isLoading } = useMyRole();
  const { identity } = useInternetIdentity();
  const { actor } = useActor(createActor);
  const [targetPrincipal, setTargetPrincipal] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.reviewer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = myRole === UserRole.admin;

  async function handleSetRole() {
    if (!actor || !targetPrincipal.trim()) return;
    setIsSubmitting(true);
    try {
      const ok = await actor.setUserRole(targetPrincipal.trim(), selectedRole);
      if (ok) {
        toast.success("Role updated", {
          description: `${targetPrincipal.slice(0, 12)}… → ${selectedRole}`,
        });
        setTargetPrincipal("");
      } else {
        toast.error("Failed to update role");
      }
    } catch {
      toast.error("Error updating role");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon size={20} className="text-primary" />
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Role management and system configuration
          </p>
        </div>
      </div>

      {/* Identity */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
          <User size={14} /> Your Identity
        </h2>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Principal</p>
          <code className="font-mono text-xs text-foreground bg-muted rounded px-2 py-1 block break-all">
            {identity?.getPrincipal().toText() ?? "—"}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Your role:</p>
          {isLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <Badge
              data-ocid="settings.role_badge"
              variant={isAdmin ? "default" : "secondary"}
              className="font-mono text-xs"
            >
              {myRole ?? "none"}
            </Badge>
          )}
        </div>
      </div>

      {/* Role assignment — admin only */}
      {isAdmin && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
            <Shield size={14} /> Assign Role
          </h2>
          <div className="space-y-3">
            <div>
              <label
                className="text-xs text-muted-foreground block mb-1"
                htmlFor="principal-input"
              >
                Principal ID
              </label>
              <input
                id="principal-input"
                data-ocid="settings.principal_input"
                type="text"
                placeholder="aaaaa-aa…"
                value={targetPrincipal}
                onChange={(e) => setTargetPrincipal(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label
                className="text-xs text-muted-foreground block mb-1"
                htmlFor="role-select"
              >
                Role
              </label>
              <select
                id="role-select"
                data-ocid="settings.role_select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={UserRole.reviewer}>reviewer</option>
                <option value={UserRole.admin}>admin</option>
              </select>
            </div>
            <Button
              data-ocid="settings.assign_role_button"
              onClick={handleSetRole}
              disabled={isSubmitting || !targetPrincipal.trim()}
              size="sm"
            >
              {isSubmitting ? "Updating…" : "Assign Role"}
            </Button>
          </div>
        </div>
      )}

      {!isAdmin && !isLoading && (
        <div className="rounded-lg border border-dashed border-border bg-card/40 py-8 flex flex-col items-center gap-2">
          <Shield size={24} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Admin access required for role management.
          </p>
        </div>
      )}
    </div>
  );
}
