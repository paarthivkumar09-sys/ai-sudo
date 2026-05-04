import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Outlet } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const { login, isAuthenticated, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = isAuthenticated;
  const isLoading = isLoggingIn || isInitializing;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm mx-auto px-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <ShieldCheck size={32} className="text-primary" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              AI Sudo
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Governance middleware for AI agents. Sign in to access the
              approval dashboard.
            </p>
          </div>
          <Button
            data-ocid="login.primary_button"
            onClick={() => login()}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Connecting…" : "Sign in with Internet Identity"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Role-based access: Admin &amp; Reviewer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
        <footer className="shrink-0 border-t border-border/40 bg-muted/20 px-6 py-2 flex items-center justify-center">
          <p className="text-[11px] text-muted-foreground/50">
            Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors underline-offset-2 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
