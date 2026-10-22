"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, UserCog } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.06] transition-colors"
      >
        <Avatar name={name} className="size-8 text-xs" />
        <ChevronDown className="size-3.5 text-muted hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 card p-1.5 shadow-lg z-50 animate-fade-in">
          <div className="px-2.5 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted truncate">{email}</p>
          </div>
          <Link
            href="/advisors/apply"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            <UserCog className="size-4 text-muted" />
            Advisor profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-danger hover:bg-danger-light"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
