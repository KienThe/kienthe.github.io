/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js")

/** @type {import("next").NextConfig} */

const config = {
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

export default config
