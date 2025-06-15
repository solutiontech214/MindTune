/** @type {import('next').NextConfig} */
const nextConfig = {
  hostname: process.env.REPLIT_DEV_DOMAIN || 'localhost',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
      bodySizeLimit: "2mb",
    },
    allowedDevOrigins: ["*"],
  },
}

export default nextConfig
