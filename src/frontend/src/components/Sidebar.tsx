import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  List,
  LogOut,
  Settings,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: ShieldCheck },
  { label: "Logs", href: "/logs", icon: List },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { identity, clear: logout, isAuthenticated } = useInternetIdentity();
  const isLoggedIn = isAuthenticated && !!identity;

  const principalShort = identity
    ? `${identity.getPrincipal().toText().slice(0, 10)}…`
    : null;

  return (
    <aside
      data-ocid="sidebar"
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-smooth relative shrink-0",
        collapsed ? "w-14" : "w-56",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-4 border-b border-border",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 shrink-0">
          <ShieldCheck size={16} className="text-primary" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-sm tracking-widest uppercase text-foreground">
            AI Sudo
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              data-ocid={`nav.${item.label.toLowerCase()}_link`}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-smooth",
                collapsed && "justify-center px-0 py-2",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* System status */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 mx-2 mb-1 rounded-md bg-emerald-500/10 border border-emerald-500/20",
          collapsed && "justify-center px-2",
        )}
      >
        <Wifi size={12} className="text-emerald-400 shrink-0" />
        {!collapsed && (
          <span className="text-xs font-mono text-emerald-400">
            System Online
          </span>
        )}
      </div>

      {/* User + logout */}
      <div className="px-2 pb-3 border-t border-border pt-3">
        {isLoggedIn && principalShort && (
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 mb-1 rounded text-xs text-muted-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 shrink-0 flex items-center justify-center">
              <span className="text-[8px] text-primary font-bold">ID</span>
            </div>
            {!collapsed && (
              <span
                className="font-mono truncate"
                title={identity?.getPrincipal().toText()}
              >
                {principalShort}
              </span>
            )}
          </div>
        )}
        <button
          type="button"
          data-ocid="sidebar.logout_button"
          onClick={() => logout()}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-smooth border border-transparent",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={14} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        data-ocid="sidebar.collapse_toggle"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-smooth z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
