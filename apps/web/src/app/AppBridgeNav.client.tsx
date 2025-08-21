/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { NavMenu } from "@shopify/app-bridge-react";

export default function AppBridgeNav() {
  return (
    <NavMenu>
      {/* First child configures the app's home. It's NOT rendered as a link. */}
      <a href="/" rel="home">
        Dashboard
      </a>
      <a href="/intelligence">Delivery Intelligence</a>
      <a href="/settings">Settings</a>
    </NavMenu>
  );
}
