/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/*': ['./data/**/*'],
  },
};

export default nextConfig;
