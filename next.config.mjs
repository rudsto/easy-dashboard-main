/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      { source: "/dashboard", destination: "/dashboard/index.html" },
    ]
  },
}

export default nextConfig
