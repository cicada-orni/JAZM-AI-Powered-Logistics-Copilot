/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { NavMenu } from "@shopify/app-bridge-react";

export default function AppBridgeNav() {
  return (
    <NavMenu>
      {/* 1st child configures your home route; it's NOT shown as a link */}
      <a rel="home" href="/">
        Dashboard
      </a>
      {/* these will appear in the Admin's left sidebar under your app */}
      <a href="/intelligence">Delivery Intelligence</a>
      <a href="/settings">Settings</a>
    </NavMenu>
  );
}
