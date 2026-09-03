import { profile } from "@/data/profile";

/**
 * Set NEXT_PUBLIC_SITE_URL in the deploy environment (Vercel: Project →
 * Settings → Environment Variables) so canonical URLs and OG images resolve
 * absolutely — set it to the custom domain once there is one.
 *
 * Without it we fall back to the Vercel project's production URL, which Vercel
 * injects automatically, so a deploy never ships localhost canonicals or OG
 * image URLs. Local builds fall back to localhost.
 */
const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")
).replace(/\/$/, "");

export const site = {
  url: siteUrl,
  title: `${profile.name} — ${profile.role}`,
  shortTitle: profile.name,
  description:
    "iOS and full-stack mobile engineer with 5 years shipping production apps to the App Store and Google Play. SwiftUI, React Native, Node and Spring Boot. Based in Da Nang, open to relocating internationally.",
} as const;
