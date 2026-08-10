import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname, // pins the root to /frontend, stops the auto-guess
  },
  allowedDevOrigins: ['10.2.0.2'],
};

export default nextConfig;
