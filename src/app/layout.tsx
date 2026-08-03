import type { Viewport } from "next";

import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/shared/SkipLink";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";
import { buildLocalBusinessJsonLd } from "@/seo/json-ld";
import { siteMetadata } from "@/seo/metadata";

import "./globals.css";

export const metadata = siteMetadata;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: siteConfig.backgroundColor },
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildLocalBusinessJsonLd();

  return (
    <html lang="ru" className={fontVariables} data-theme="dark">
      <body className="font-body antialiased">
        <SkipLink />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
