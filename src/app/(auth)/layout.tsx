import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-primary">
          AssetTracker<span className="text-foreground"> KE</span>
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
