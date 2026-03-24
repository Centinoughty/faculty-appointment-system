/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep your allowed IP from earlier
  allowedDevOrigins: ['192.168.42.88'],

  // ADD THIS REWRITES BLOCK:
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.42.44:8000/api/:path*' // Proxy to FastAPI
      }
    ]
  }
};

export default nextConfig; // or module.exports = nextConfig;