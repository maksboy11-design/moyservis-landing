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

const nextConfig: NextConfig = {
  // Dev (turbopack) → `.next`; `next build` / `next start` → `.next-out`.
  // Splitting avoids OneDrive readlink corruption + turbopack/webpack clashes.
  distDir: process.env.NEXT_DIST_DIR || (isDevCli ? ".next" : ".next-out"),
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(process.cwd()),
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Remote CDNs removed: landing media is local under /public/images.
    // Remote fetch via /_next/image caused 504 when upstream was unreachable.
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
