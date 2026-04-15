/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'localhost',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_APP_NAME: 'Holy Relationship Marriage Matrimony',
    NEXT_PUBLIC_APP_NAME_BN: 'হোলি রিলেশনশিপ ম্যারেজ ম্যাট্রিমনি',
  },
};

module.exports = nextConfig;
