import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-dialog',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default config
