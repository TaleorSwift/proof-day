import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'picsum.photos' },
      ...(isDev ? [
        { protocol: 'http' as const, hostname: '127.0.0.1' },
        { protocol: 'http' as const, hostname: 'localhost' },
      ] : []),
    ],
  },
};

export default nextConfig;
