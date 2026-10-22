import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <MarketingNav />
      <div className="flex-1 flex flex-col">{children}</div>
      <MarketingFooter />
    </div>
  );
}
