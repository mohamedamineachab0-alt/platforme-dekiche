import type { NextConfig } from "next";

const languageAdminRewrites = [
  "lessons",
  "codes",
  "students",
  "students/monitoring",
  "subscription-requests",
  "forums",
  "lesson-opinions",
  "exercises",
  "seed-content",
  "exams",
  "review-cards",
  "mistakes",
  "tenebati",
  "notifications",
  "live-classes",
  "leaderboard",
  "teachers",
  "teachers/revenues",
].map((path) => ({
  source: `/dashboard/admin/languages/${path}`,
  destination: `/dashboard/admin/${path}?adminBranch=languages`,
}));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return languageAdminRewrites;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
      allowedOrigins: [
        'dekiche-academy.com', 
        'www.dekiche-academy.com', 
        '*.dekiche-academy.com',
        '*.vercel.app',
        'localhost:3000'
      ],
    },
  },
  // Allow network access from external local devices (e.g., phones testing on the same Wi-Fi)
  allowedDevOrigins: ['172.20.10.3', '10.125.237.128'],
};

export default nextConfig;
