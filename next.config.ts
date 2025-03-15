import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false, // Disable strict mode (optional)
    // swcMinify: true, // Enable SWC minification
    compiler: {
        styledComponents: true, // Enable styled-components support
    },
    eslint: {
        ignoreDuringBuilds: true, // ✅ Ignore ESLint errors during build
    },
    typescript: {
        ignoreBuildErrors: true, // ✅ Ignore TypeScript errors during build
    },
    experimental: {
        // ✅ Fix: Ensure correct properties under `experimental`
        serverActions: {
            bodySizeLimit: "100mb", // ✅ Example: Limit request body size (adjust as needed)
            allowedOrigins: ["https://broadcastly.io", "https://chattflow.com"], // ✅ Example: Allowed domains for actions
        },
    },
    output: "standalone", // ✅ Ensure the app works inside Docker
};

export default nextConfig;
