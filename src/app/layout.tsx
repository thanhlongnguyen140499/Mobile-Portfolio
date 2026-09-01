import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import { site } from "@/lib/site";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/intro/Preloader";
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

/*
 * Runs during HTML parsing, before the first paint — which is the whole point.
 *
 * The device flight in scene/Device.tsx is driven by scroll position, so a
 * visitor who flicks the trackpad while the WebGL chunk is still downloading
 * has already scrubbed past the animation's entire input range before it can
 * play. Marking <html> here puts the CSS scroll hold in globals.css into force
 * immediately, rather than whenever the bundle finishes hydrating — by which
 * time the page could already have moved.
 *
 * <Preloader> takes ownership of the attribute once it mounts. The timeout is
 * the escape hatch for the case it never does (a chunk that 404s, a hydration
 * crash): a visitor must never be left holding a page that won't scroll.
 */
const INTRO_BOOTSTRAP = `(function(){try{var e=document.documentElement;e.dataset.intro="loading";setTimeout(function(){if(e.dataset.intro==="loading"){delete e.dataset.intro;var n=document.getElementById("intro");if(n)n.style.display="none"}},8000)}catch(_){}})()`;

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
      <head>
        <script
          /* text/plain on the client so React doesn't warn about a rendered
             <script>; it only ever needs to execute on a hard load anyway. */
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: INTRO_BOOTSTRAP }}
        />
        {/* Without JS the attribute above is never set, so the scroll hold and
            the entrance transitions are already inert — but the overlay is
            server-rendered markup and would sit there forever. */}
        <noscript>
          <style>{`#intro{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="bg-ink text-bone antialiased">
        <Preloader />
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
