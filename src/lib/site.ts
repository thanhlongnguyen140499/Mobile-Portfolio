import { profile } from "@/data/profile";

/**
 * Set NEXT_PUBLIC_SITE_URL in the deploy environment (Vercel: Project →
 * Settings → Environment Variables) so canonical URLs and OG images resolve
 * absolutely. The fallback keeps local builds working.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const site = {
  url: siteUrl,
  title: `${profile.name} — ${profile.role}`,
  shortTitle: profile.name,
  description:
    "iOS and full-stack mobile engineer with 5 years shipping production apps to the App Store and Google Play. SwiftUI, React Native, Node and Spring Boot. Based in Da Nang, open to relocating internationally.",
} as const;
