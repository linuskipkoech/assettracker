"use client";

import { useEffect } from "react";

// Catches errors thrown by the root layout itself (rare, but without this
// the user would see an unstyled blank page instead of any message).
// Next.js requires this file to render its own <html>/<body> since it
// replaces the root layout when triggered.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "#f6f7f4",
            color: "#161813",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
            <p style={{ color: "#6b7169", marginTop: "0.5rem" }}>
              Please refresh the page.
            </p>
            <button
              onClick={() => reset()}
              style={{
                marginTop: "1.5rem",
                background: "#15803d",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.6rem 1.25rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
