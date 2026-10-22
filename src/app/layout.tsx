import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "AssetTracker KE — Track every asset in one place",
    template: "%s · AssetTracker KE",
  },
  description:
    "Track farms, livestock, businesses, stocks, land, and property in one dashboard, with AI-powered guidance and access to professional advisors.",
  openGraph: {
    title: "AssetTracker KE",
    description:
      "Track farms, livestock, businesses, stocks, land, and property in one dashboard.",
    type: "website",
    locale: "en_KE",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f0a" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>
          <div className="flex-1 flex flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
