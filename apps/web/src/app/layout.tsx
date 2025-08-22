/* eslint-disable @next/next/no-sync-scripts */

import type { Metadata } from "next";
import "./globals.css";
import "@shopify/polaris/build/esm/styles.css";
import { display, body } from "./fonts";
import Providers from "./providers";
import AppBridgeNav from "./AppBridgeNav.client";

export const metadata: Metadata = {
  title: "JAZM",
  description: "AI-powered logistics copilot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      {/* IMPORTANT: render a real <head> so AB loads synchronously */}
      <head suppressHydrationWarning>
        {/* 1) Critical paint: prevent white flash from first render */}
        <style id="jazm-critical">{`
    :root { color-scheme: dark; }         /* hint the UA chrome/UI to go dark */
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background-color: #0a0a0a;          /* your dark background */
      color: #e5e7eb;                     /* your light text */
    }
  `}</style>

        {/* 2) App Bridge v4 needs this meta BEFORE the script */}
        <meta
          name="shopify-api-key"
          content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? ""}
        />

        {/* 3) App Bridge v4 must be a plain, synchronous CDN script & first script */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
      </head>

      <body>
        <Providers>
          <AppBridgeNav />
          <div className="jazm-theme">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
