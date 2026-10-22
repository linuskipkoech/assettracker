import type { NextConfig } from "next";

const securityHeaders = [
  // Prevents the app from being embedded in a hostile iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stops the browser from MIME-sniffing responses into something unsafe.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limits how much of our URL/path is leaked to other origins via the Referer header.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disables browser features this app never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // better-sqlite3 ships a native binary and must be loaded as a real
  // Node.js module rather than bundled — this keeps it out of the
  // server bundle (Next resolves it via require() at runtime instead).
  serverExternalPackages: ["better-sqlite3"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
