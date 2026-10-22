import type { ReactNode } from "react";
import { requireUser } from "@/lib/session";
import { AppShell } from "@/components/app-shell/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell user={{ name: user.name ?? "You", email: user.email ?? "" }}>
      {children}
    </AppShell>
  );
}
