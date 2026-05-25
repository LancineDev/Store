import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Explicitly set the root directory to handle monorepo structure
  turbopack: {
    root: ".",
  },
  typescript: {
    // Do not ignore build errors in production — fail the build on type errors
    ignoreBuildErrors: false,
  },
  images: {
    // Enable Next.js image optimization in production
    unoptimized: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            // Allow inline scripts/styles where required (temporary) — adjust for stricter policy as needed
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
          },
        ],
      },
    ]
  },
}

export default nextConfig
