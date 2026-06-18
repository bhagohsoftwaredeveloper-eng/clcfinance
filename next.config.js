// Plain JS config (not .ts) so `next start` never needs to install TypeScript at
// runtime to load the config — that runtime install made the Railway container
// slow/unstable on boot.

const isElectron = process.env.ELECTRON === 'true';
const isProduction = process.env.NODE_ENV === 'production';
const isElectronProduction = isElectron && isProduction;

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable PWA in Electron builds AND in development. next-pwa is not
  // Turbopack-compatible and the service-worker compile/caching slows down
  // `next dev` first load. PWA stays active for production (web) builds.
  disable: isElectron || !isProduction,
  buildExcludes: [/manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
    ],
    unoptimized: true, // Always use unoptimized images
  },
  // Electron production-specific configuration - only apply in production builds
  ...(isElectronProduction && {
    trailingSlash: true,
    distDir: 'out',
    assetPrefix: './',
    basePath: '',
  }),
  // Disable server-side features in Electron build
  ...(isElectron && {
    serverExternalPackages: [],
  }),
};

module.exports = withPWA(nextConfig);
