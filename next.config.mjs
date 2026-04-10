/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/register",
        destination: "/api/auth/register",
      },
      {
        source: "/party/create",
        destination: "/api/parties",
      },
    ];
  },
};

export default nextConfig;
