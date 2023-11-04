/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  future: {
    webpack5: false,
  },
  webpack: (config, {}) => {
      config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
        return config;
  },
};
