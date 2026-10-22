"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Plus } from "lucide-react";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { ReactNode } from "react";

export function AppShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar-bg border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80%] bg-sidebar-bg border-r border-sidebar-border flex flex-col animate-fade-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-sidebar-muted hover:text-sidebar-fg"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden btn-ghost size-9 rounded-lg flex items-center justify-center -ml-1.5"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Link
              href="/assets/new"
              className="btn-primary text-sm px-3.5 py-2 hidden sm:inline-flex"
            >
              <Plus className="size-4" />
              Add asset
            </Link>
            <ThemeToggle />
            <UserMenu name={user.name} email={user.email} />
          </div>
        </header>

        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <Link href="/dashboard" className="font-bold text-lg text-white">
          AssetTracker<span className="text-primary"> KE</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="p-3 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-muted px-3 leading-relaxed">
          Need tailored advice? Book a professional advisor from the sidebar.
        </p>
      </div>
    </>
  );
}
