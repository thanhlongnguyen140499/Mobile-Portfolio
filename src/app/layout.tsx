import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import { site } from "@/lib/site";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SceneRoot } from "@/components/scene/SceneRoot";
import { getDeviceSpecs } from "@/lib/devices";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${profile.name}`,
  },
  description: site.description,
  applicationName: profile.name,
  authors: [{ name: profile.name }],
  creator: profile.name,
  keywords: [
    "iOS developer",
    "SwiftUI",
    "React Native",
    "mobile engineer",
    "Swift",
    "Next.js",
    "Singapore",
    "Australia",
    "Da Nang",
    profile.name,
  ],
  openGraph: {
    type: "profile",
    siteName: profile.name,
    title: site.title,
    description: site.description,
    url: site.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
};

/**
 * Person schema so a recruiter searching the name gets a rich result, and so
 * the CV name and the working name are explicitly linked.
 */
function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.alternateName,
    jobTitle: profile.role,
    description: profile.summary,
    /* No `email` here on purpose. <ObfuscatedEmail> keeps the address out of
       the served HTML, and putting it back into the structured data would hand
       it to exactly the scrapers that split is meant to defeat. The phone stays
       because it's already a plain tel: link on the page. */
    telephone: profile.phone.dial,
    url: site.url,
    image: `${site.url}${profile.avatar.src}`,
    address: { "@type": "PostalAddress", addressLocality: "Da Nang", addressCountry: "VN" },
    sameAs: [profile.links.linkedin, profile.links.github],
    knowsLanguage: profile.languages.map((l) => l.name),
    alumniOf: profile.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.school,
    })),
  };
  return (
    <script
      type="application/ld+json"
      // Content is authored here, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  /* Mounted at the layout level, not per page: the WebGL context and its
     textures then survive navigation into a case study and back. The scene
     parks its render loop on routes that have no devices. */
  const devices = await getDeviceSpecs();

  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink text-bone antialiased">
        <SmoothScroll />
        <SceneRoot devices={devices} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-bone focus:px-5 focus:py-2 focus:text-sm focus:font-medium focus:text-ink"
        >
          Skip to content
        </a>
        {children}
        <PersonJsonLd />
        <Analytics />
      </body>
    </html>
  );
}
