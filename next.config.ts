import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components off: keeps data fetching simple (no Suspense required per dynamic page).
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
