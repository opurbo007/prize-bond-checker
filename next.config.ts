import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true, // ✅ Helps catch potential issues in dev
  swcMinify: true, // ✅ Faster production builds
  output: "standalone", // ✅ Good for Docker/production deployments
  typescript: {
    ignoreBuildErrors: false, // ✅ Fail build on TS errors (safer for prod)
  },
  eslint: {
    ignoreDuringBuilds: false, // ✅ Fail build on lint errors (can turn true to ignore)
  },
  images: {
    domains: ["example.com"], // ✅ Add your allowed image domains
  },
  webpack: (config, { isServer }) => {
    // Example: Add custom alias
    config.resolve.alias["@components"] = path.join(__dirname, "components");
    return config;
  },
};

export default nextConfig;
