
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3001",
        "*.replit.dev",
        "*.repl.co",
        "*.pike.replit.dev",
        process.env.REPLIT_DEV_DOMAIN,
        process.env.REPL_SLUG && `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`,
      ].filter(Boolean),
      bodySizeLimit: "2mb",
    },
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
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

export default nextConfig
