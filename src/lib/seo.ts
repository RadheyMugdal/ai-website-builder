export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://wavelybuilder.vercel.app";

export const seo = {
  name: "Wavely",
  title: "Wavely – AI Website Builder",
  description:
    "Create and launch beautiful, production-ready websites with AI. Generate, edit, and publish in minutes.",
  keywords: [
    "AI website builder",
    "generate website with AI",
    "no-code website",
    "landing page generator",
    "Wavely",
  ],
  creator: "Wavely",
  twitter: {
    handle: "@MugdalRadhey",
    site: "@MugdalRadhey",
    cardType: "summary_large_image" as const,
  },
  openGraph: {
    type: "website" as const,
    locale: "en_US",
    url: "",
    siteName: "Wavely",
    images: [
      {
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://wavelybuilder.vercel.app"
        }/wavely-logo.png`,
        width: 1200,
        height: 630,
        alt: "Wavely – AI Website Builder",
      },
    ],
  },
};

export const defaultCanonical = (path: string = "/"): string => {
  const base = siteUrl;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
};

export type JsonLd = Record<string, unknown>;

export const organizationJsonLd = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: seo.name,
  url: siteUrl,
  logo: `${siteUrl}/wavely-logo.png`,
});

export const websiteJsonLd = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: seo.title,
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});
