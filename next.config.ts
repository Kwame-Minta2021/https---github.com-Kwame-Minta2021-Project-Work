
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // i18n: { // next-i18next handles this differently, often not needed here for App Router
  //   locales: ['en', 'fr', 'tw'],
  //   defaultLocale: 'en',
  // },
};

export default nextConfig;
