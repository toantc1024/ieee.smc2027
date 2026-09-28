import type { NextConfig } from "next";

const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  // Use standalone output for Docker / self-hosted deployments.
  // Must be disabled on Vercel so Vercel can manage its native serverless tracing.
  ...(isVercel ? {} : { output: "standalone" }),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;

