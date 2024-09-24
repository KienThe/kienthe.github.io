/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js")

/** @type {import("next").NextConfig} */
const config = {
  output: "export",
  distDir: ".dist",
  // Ensure API routes are not included in the static export
  // async redirects() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: '/404',
  //       permanent: false,
  //     },
  //   ];
  // },
  images: {
    domains: ["https://i.ibb.co"]
  }
}

export default config
