/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js")

/** @type {import("next").NextConfig} */

const config = {
  // ...(process.env.NODE_ENV === "production" && {
  //   output: "export",
  // }),
  reactStrictMode: true,
  // swcMinify: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co"
      }
    ],
    unoptimized: true
  },
  webpack: (config, _) => ({
    ...config,
    watchOptions: {
      ...config.watchOptions,
      poll: 800,
      aggregateTimeout: 300
    }
  })
}

export default config
