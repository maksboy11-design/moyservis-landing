import type { NextConfig } from "next";
import path from "path";

/**
 * Security + performance foundation (Stage 1).
 * Lead API / CSP nonce refinements — later stages.
 *
 * Headers intentionally exclude `/_next/static` and `/_next/image`:
 * those routes must keep Next’s native Content-Type. Applying
 * `X-Content-Type-Options: nosniff` on HTML error bodies for asset
 * URLs produces browser MIME refusals (style/script blocked as text/html).
 */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const isDevCli = process.argv.includes("dev");
// Vercel/CI expect the default `.next` output directory.
const isHostedBuild =
  process.env.VERCEL === "1" || process.env.CF_PAGES === "1";

const nextConfig: NextConfig = {
  // Local: turbopack → `.next`; `next build`/`start` → `.next-out`
  // (avoids OneDrive + turbopack/webpack clashes). Hosted platforms → `.next`.
  distDir:
    process.env.NEXT_DIST_DIR ||
    (isHostedBuild || isDevCli ? ".next" : ".next-out"),
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(process.cwd()),
  poweredByHeader: false,
  images: {
    // Assets are already WebP under /public/images. On Vercel the
    // `/_next/image` optimizer returned 404 (broken by services deploy
    // output), while direct `/images/*` URLs work — serve them as-is.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source:
          "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
