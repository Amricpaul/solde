import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to accept requests proxied through ngrok tunnels.
  // Next blocks cross-origin dev assets/HMR by default.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.app", "*.ngrok.io"],
  async headers() {
    return [
      {
        // The service worker must not be cached and needs full-scope control.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
