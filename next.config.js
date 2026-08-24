/** @type {import('next').NextConfig} */
const normalizeApiUrl = (url) => url.replace(/\/+$|\/+$/g, '');
 const defaultApiUrl = 'http://localhost:5000/api';
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;
const normalizedApiUrl = normalizeApiUrl(rawApiUrl).endsWith('/api')
  ? normalizeApiUrl(rawApiUrl)
  : `${normalizeApiUrl(rawApiUrl)}/api`;

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
    NEXT_PUBLIC_API_URL: normalizedApiUrl,
    NEXT_PUBLIC_APP_NAME: 'Holy Relationship Marriage Matrimony',
    NEXT_PUBLIC_APP_NAME_BN: 'হোলি রিলেশনশিপ ম্যারেজ ম্যাট্রিমনি',
  },
};

module.exports = nextConfig;
