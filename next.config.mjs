/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/manager',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/manager/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
