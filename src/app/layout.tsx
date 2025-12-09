
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import {
  defaultCanonical,
  seo,
  siteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seo.title,
    template: "%s | Wavely",
  },
  description: seo.description,
  keywords: seo.keywords,
  creator: seo.creator,
  alternates: {
    canonical: defaultCanonical("/"),
  },
  openGraph: {
    type: seo.openGraph.type,
    locale: seo.openGraph.locale,
    url: siteUrl,
    siteName: seo.openGraph.siteName,
    title: seo.title,
    description: seo.description,
    images: seo.openGraph.images,
  },
  twitter: {
    card: seo.twitter.cardType,
    creator: seo.twitter.handle,
    site: seo.twitter.site,
    title: seo.title,
    description: seo.description,
    images: seo.openGraph.images?.map((i) => i.url) ?? [],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={defaultCanonical("/")} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]),
          }}
        />
      </head>
      <TRPCReactProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}

            <Toaster />
          </ThemeProvider>
        </body>
      </TRPCReactProvider>
    </html>
  );
}
