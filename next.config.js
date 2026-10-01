/** @type {import('next').NextConfig} */
const { version } = require('./package.json')

const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  reactStrictMode: true,
  
  // PWA Support
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        // The manifest's URL never changes, so it must revalidate. Marking it
        // immutable for a year meant icon and color updates never reached
        // anyone who had already loaded it.
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 750, 828, 1080, 1200],
  },
}

module.exports = nextConfig
