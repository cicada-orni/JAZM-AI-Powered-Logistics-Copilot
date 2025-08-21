import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "@shopify/polaris/build/esm/styles.css";
import { display, body } from "./fonts";
import Providers from "./providers";
import AppBridgeNav from "./AppBridgeNav.client";

export const metadata: Metadata = {
  title: "JAZM",
  description: "Al-powered logistics copilot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        {/* App Bridge v4 needs API key + script (no React Provider required) */}
        <meta
          name="shopify-api-key"
          content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY}
        />
        <Script
          id="shopify-app-bridge"
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <Providers>
          {/* Configure the Shopify Admin sidebar via App Bridge */}
          <AppBridgeNav />
          {/* Brand scope around *our* content only */}
          <div className="jazm-theme">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
