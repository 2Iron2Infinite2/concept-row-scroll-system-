/** @type {import('next').NextConfig} */
const repo = "concept-row-scroll-system-";
const isProd = process.env.NODE_ENV === "production";

export default {
  output: "export",
  images: { unoptimized: true },
  basePath: `/${repo}`,
  // Load JS/CSS from your GitHub Pages URL in production
  assetPrefix: isProd ? `https://2Iron2Infinite2.github.io/${repo}` : undefined,
  // Expose the base path for things like the favicon
  env: {
    NEXT_PUBLIC_BASE_PATH: `/${repo}`,
  },
};
