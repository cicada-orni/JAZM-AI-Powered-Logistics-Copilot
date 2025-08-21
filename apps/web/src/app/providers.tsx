"use client";

import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import Link from "next/link";
import React from "react";

/** Match Polaris Link-like props without using `any` */
type LinkLikeProps = {
  children?: React.ReactNode;
  url?: string;
  external?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

function NextLink({ children, url = "", external, ...rest }: LinkLikeProps) {
  if (external)
    return (
      <a href={url} {...rest}>
        {children}
      </a>
    );
  return (
    <Link href={url} {...rest}>
      {children}
    </Link>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider i18n={en} theme="dark-experimental" linkComponent={NextLink}>
      {children}
    </AppProvider>
  );
}
