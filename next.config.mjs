import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable source maps in production for better debugging
  productionBrowserSourceMaps: true,
  images: {
    unoptimized: false,
    domains: [
      'localhost',
      'images.unsplash.com',
      'cdn.pixabay.com',
      'loremflickr.com',
      'pexels.com',
      // ...existing domains...
    ],
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'image.lexica.art',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.pexels.com',
      },
    ],
  },
  async rewrites() {
    return [
      // Handle API route fallbacks to prevent 404 errors
      // Any other rewrites you need to add for missing API endpoints
    ];
  },
  async headers() {
    console.log('[Headers Function] Applying headers (CSP permanently disabled in this version)');

    // Basic security headers applied to all routes
    const baseSecurityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
    ];

    // Return only the base security headers, CSP is removed
    return [
      {
        source: '/:path*',
        headers: baseSecurityHeaders,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        { 'service-worker': 'self.ServiceWorkerGlobalScope' },
      ];

      // Add fallbacks for OpenTelemetry dynamic imports
      config.resolve.fallback = {
        ...config.resolve.fallback,
        module: false,
        perf_hooks: false,
        diagnostics_channel: false,
      };
    }

    // Create a new watchOptions configuration
    config.watchOptions = {
      ...(config.watchOptions || {}),
      // Use only string patterns for ignored
      ignored: [
        '**/node_modules/**',
        '**/mobile/withme-app/**',
        '**/scripts/**',
        // Add new ignores
        '**/__tests__/**',
        '**/tests/**',
        '**/_disabled_features/**',
        '**/coverage/**',
        '**/playwright-report/**',
        '**/build/**', // Ignore the build output directory
        '**/.next/**', // Ignore the next build cache
      ],
    };

    // Exclude directories from webpack processing without using custom loaders
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: [
        /mobile\/withme-app\//,
        /scripts\//,
        // Add new excludes as regex
        /__tests__\//,
        /tests\//,
        /_disabled_features\//,
        /coverage\//,
        /playwright-report\//,
        /build\//, // Exclude the build output directory
        /.next\//, // Exclude the next build cache
      ],
      // Do not include a custom loader here as Next.js has its own
    });

    return config;
  },
  // Exclude specific directories from build process
  //distDir: 'build',
  // Explicitly specify which directories to exclude from build process
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  // Enable optimizePackageImports to reduce bundle size for large packages
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'lodash',
      '@heroicons/react',
    ],
  },
  serverExternalPackages: [
    'require-in-the-middle',
    '@opentelemetry/instrumentation',
    'pino-pretty',
    '@aws-sdk',
  ],
};

// Temporarily remove wrappers
// const analyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
// export default withSentryConfig(analyzer(nextConfig), { /* Sentry options */ });

// Only enable Sentry in non-development environments
const isDev = process.env.NODE_ENV === 'development';

// Export the raw config for testing
export default nextConfig;
