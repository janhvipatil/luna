"use client";

import { useEffect } from "react";

/**
 * Root error boundary — renders when the root layout itself throws, so it must
 * provide its own <html>/<body> and can't rely on the app's CSS/theme. Kept
 * intentionally minimal and self-styled.
 */
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#0a0a0f",
          color: "#ececf1",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Luna hit a snag</h1>
        <p style={{ color: "#9a9aa6", maxWidth: "24rem", fontSize: "0.875rem" }}>
          The app failed to load. Reloading usually fixes it.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#d9577a",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1.25rem",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
