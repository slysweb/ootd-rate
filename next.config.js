/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/openai/:path*',
        destination: 'https://api.openai.com/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 