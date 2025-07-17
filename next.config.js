/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'isyhakwwgdozgtlquzis.supabase.co'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig; 