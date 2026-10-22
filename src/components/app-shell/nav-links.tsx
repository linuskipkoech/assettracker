"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  TrendingDown,
  Users,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Sprout,
  type LucideIcon,
} from "lucide-react";

export const NAV_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "Assets", icon: Wallet },
  { href: "/liabilities", label: "Liabilities", icon: TrendingDown },
  { href: "/crop-cycles", label: "Crop Cycles", icon: Sprout },
  { href: "/advisors", label: "Advisors", icon: Users },
  { href: "/consultations", label: "Consultations", icon: MessageSquare },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/beneficiaries", label: "Beneficiaries", icon: ShieldCheck },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_LINKS.map((link) => {
        const active = pathname?.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-active text-white"
                : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-sidebar-fg"
            }`}
          >
            <Icon
              className={`size-[18px] shrink-0 ${active ? "text-primary" : "text-sidebar-muted group-hover:text-sidebar-fg"}`}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
