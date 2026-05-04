import { c as createLucideIcon, o as useInternetIdentity, r as reactExports, j as jsxRuntimeExports, p as Settings$1, S as Skeleton, B as Button, i as ue } from "./index-Ai3gszGZ.js";
import { f as useMyRole, g as useActor, U as UserRole, h as createActor } from "./use-backend-Cq3ihEoA.js";
import { B as Badge } from "./badge-qebL2BM0.js";
import { S as Shield } from "./shield-CTnnNsS6.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
function Settings() {
  const { data: myRole, isLoading } = useMyRole();
  const { identity } = useInternetIdentity();
  const { actor } = useActor(createActor);
  const [targetPrincipal, setTargetPrincipal] = reactExports.useState("");
  const [selectedRole, setSelectedRole] = reactExports.useState(UserRole.reviewer);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const isAdmin = myRole === UserRole.admin;
  async function handleSetRole() {
    if (!actor || !targetPrincipal.trim()) return;
    setIsSubmitting(true);
    try {
      const ok = await actor.setUserRole(targetPrincipal.trim(), selectedRole);
      if (ok) {
        ue.success("Role updated", {
          description: `${targetPrincipal.slice(0, 12)}… → ${selectedRole}`
        });
        setTargetPrincipal("");
      } else {
        ue.error("Failed to update role");
      }
    } catch {
      ue.error("Error updating role");
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-6 py-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings$1, { size: 20, className: "text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-xl font-bold text-foreground", children: "Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Role management and system configuration" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display font-semibold text-sm text-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 14 }),
        " Your Identity"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Principal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono text-xs text-foreground bg-muted rounded px-2 py-1 block break-all", children: (identity == null ? void 0 : identity.getPrincipal().toText()) ?? "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Your role:" }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            "data-ocid": "settings.role_badge",
            variant: isAdmin ? "default" : "secondary",
            className: "font-mono text-xs",
            children: myRole ?? "none"
          }
        )
      ] })
    ] }),
    isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display font-semibold text-sm text-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 14 }),
        " Assign Role"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              className: "text-xs text-muted-foreground block mb-1",
              htmlFor: "principal-input",
              children: "Principal ID"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "principal-input",
              "data-ocid": "settings.principal_input",
              type: "text",
              placeholder: "aaaaa-aa…",
              value: targetPrincipal,
              onChange: (e) => setTargetPrincipal(e.target.value),
              className: "w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              className: "text-xs text-muted-foreground block mb-1",
              htmlFor: "role-select",
              children: "Role"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "role-select",
              "data-ocid": "settings.role_select",
              value: selectedRole,
              onChange: (e) => setSelectedRole(e.target.value),
              className: "h-9 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: UserRole.reviewer, children: "reviewer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: UserRole.admin, children: "admin" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            "data-ocid": "settings.assign_role_button",
            onClick: handleSetRole,
            disabled: isSubmitting || !targetPrincipal.trim(),
            size: "sm",
            children: isSubmitting ? "Updating…" : "Assign Role"
          }
        )
      ] })
    ] }),
    !isAdmin && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed border-border bg-card/40 py-8 flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 24, className: "text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Admin access required for role management." })
    ] })
  ] });
}
export {
  Settings as default
};
