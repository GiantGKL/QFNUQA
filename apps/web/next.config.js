/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 设置 USE_EXPRESS_PROXY=true 时代理到 Express 后端（本地双服务开发）
  // 不设置时直接使用 Next.js API Routes（部署模式 / 单服务开发）
  ...(process.env.USE_EXPRESS_PROXY === 'true' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ];
    },
  }),
};

module.exports = nextConfig;
