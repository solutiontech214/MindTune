/** @type {import('next').NextConfig} */
const nextConfig = {
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
      allowedOrigins: [
        "localhost:3001",
        "*.replit.dev",
        "*.repl.co",
        "*.pike.replit.dev",
        process.env.REPLIT_DEV_DOMAIN,
      ].filter(Boolean),
      bodySizeLimit: "2mb",
    },
    allowedDevOrigins: [
      "*.replit.dev",
      "*.repl.co", 
      "*.pike.replit.dev",
      process.env.REPLIT_DEV_DOMAIN,
    ].filter(Boolean),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

export default nextConfig
