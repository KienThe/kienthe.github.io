/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js")

/** @type {import("next").NextConfig} */
const nextConfig = {
  webpack: (config, { webpack, isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        readline: false
      }
    }

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/
      })
    )
    return config
  },
  ...(process.env.NODE_ENV === "production" && {
    output: "export"
  }),
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co"
      }
    ],
    unoptimized: true
  }
}

export default nextConfig
