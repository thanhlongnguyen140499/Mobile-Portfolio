export type StoreLinks = {
  appStore?: string;
  playStore?: string;
  site?: string;
  /** Apple numeric app id — the key `scripts/fetch-store-assets.mjs` works from. */
  appleId?: string;
  /**
   * Storefront to read the listing from. Ratings are per-country and the gap is
   * large — Caloer is 4.7 from ~4,900 ratings on "vn" and 4.4 from 71 on "us" —
   * so each app names the store its audience actually uses. Defaults to "us".
   */
  storefront?: string;
};

export type Metric = { value: string; label: string };

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  role: string;
  period: string;
  /** Who it was built for, in one line. */
  context: string;
  /** Featured projects get a 3D device in the gallery; the rest get cards. */
  featured: boolean;
  /** Hex — used for both CSS and three.js, so keep it a plain string. */
  accent: string;
  deviceKind: "iphone" | "ipad";
  /** How many screenshots to pull from the listing. */
  screenCount: number;
  /**
   * Picks specific screenshots out of a listing by index. Some templates mix
   * usable upright mockups with tilted or multi-device ones.
   */
  screenIndices?: number[];
  /**
   * A screen rect measured by hand, as fractions of the source image, for
   * listings that defeat both auto-detectors. Applied to every shot, since a
   * listing uses one template throughout.
   */
  screenCrop?: { x: number; y: number; w: number; h: number };
  /**
   * Overrides the asset script's guess about what kind of art the listing has.
   * "capture" = bare screens, safe to map onto the 3D device. "marketing" =
   * designed panels, gallery only. Leave unset to let the script decide.
   */
  screenStyle?: "capture" | "marketing";
  links: StoreLinks;
  metrics: Metric[];
  problem: string;
  approach: string[];
  impact: string[];
  tech: string[];
};

export const projects: Project[] = [
  {
    slug: "wispr-network",
    name: "Wispr Network",
    tagline: "A private, agent-only marketplace for homes that never hit the open market.",
    role: "Web & Mobile Developer → Front End Developer",
    period: "01/2024 – 12/2025",
    context: "Company product · HomeWayz, Inc. · live on the App Store and Google Play",
    featured: true,
    accent: "#3ba9d4",
    deviceKind: "iphone",
    screenCount: 5,
    links: {
      appStore: "https://apps.apple.com/vn/app/wispr-network/id6479228847",
      appleId: "6479228847",
      site: "https://wisprnetwork.com/",
    },
    metrics: [
      { value: "2 yrs", label: "Shipped and maintained" },
      { value: "iOS 15.1+", label: "Deployment target" },
      { value: "2 stores", label: "iOS and Android" },
    ],
    problem:
      "Real-estate agents trade pre-market and off-market inventory privately, long before a listing goes public. That whole market lived in group chats and spreadsheets — no search, no matching, no way to know an opportunity existed until it was gone.",
    approach: [
      "Built property search over a private inventory with multi-criteria filters — location, price band, bedrooms and more — so agents can narrow a hidden database down to a client's brief in a few taps.",
      "Implemented authentication, in-app chat between agents, and bulk upload of files and images for listing packets.",
      "Integrated Google Maps for personalised neighbourhood maps, contact sync from Google and Microsoft accounts, and Stripe for payments.",
      "Migrated data fetching to RTK Query, collapsing hand-rolled request state into a cache with consistent loading and invalidation.",
      "Set up CI/CD release automation with Fastlane, shortening the path from merge to store build.",
      "Designed responsive layouts across desktop, tablet and mobile breakpoints, and ran usability testing to find where agents actually got stuck.",
    ],
    impact: [
      "Shipped to both the App Store and Google Play and maintained through 1.2.x.",
      "Fastlane automation removed the manual archive-and-upload ritual from every release.",
      "Usability testing fed directly back into search and map interaction changes.",
    ],
    tech: [
      "React Native",
      "NextJS",
      "TypeScript",
      "Redux / RTK Query",
      "Stripe",
      "Google Maps",
      "Firebase",
      "Tailwind CSS",
      "React Native Paper",
      "MongoDB",
      "Fastlane",
    ],
  },
  {
    slug: "philadelphia-inquirer",
    name: "The Philadelphia Inquirer",
    tagline:
      "Bringing SwiftUI to a 380-file UIKit news app that Philadelphia reads every morning.",
    role: "iOS Developer",
    period: "01/2026 – Present",
    context: "Client engagement · Philadelphia Media Network · App Store and Google Play",
    featured: true,
    accent: "#e0a13a",
    deviceKind: "iphone",
    screenCount: 5,
    links: {
      appStore: "https://apps.apple.com/us/app/the-philadelphia-inquirer/id577251728",
      appleId: "577251728",
      storefront: "us",
      playStore: "https://play.google.com/store/apps/details?id=com.ap.philly",
    },
    metrics: [
      { value: "4.6★", label: "App Store · 18K+ ratings" },
      { value: "380", label: "UIKit files bridged into" },
      { value: "iOS 16+", label: "Deployment target" },
    ],
    problem:
      "A news app that has shipped since 2012 can't stop to be rewritten. New feature work needed to move at SwiftUI speed inside a large, live UIKit codebase — and the existing data layer had race conditions that surfaced whenever two refreshes overlapped.",
    approach: [
      "Built SwiftUI feature modules on MVVM — ObservableObject view models with @Published state — keeping presentation logic out of the views and fully unit-testable.",
      "Adopted Swift Concurrency (async/await, Task, @MainActor) across the data layer, eliminating race conditions on concurrent refresh.",
      "Built reusable @ViewBuilder component libraries with adaptive iPhone and iPad layouts over a shared dark-mode token system.",
      "Cut redundant network calls with cursor pagination and response plus image caching, and added shimmer placeholders so the feed feels instant while it loads.",
      "Bridged SwiftUI into the 380-file UIKit codebase via UIHostingController, so new screens land in SwiftUI without disturbing what already ships.",
      "Instrumented typed analytics and wrote XCTest coverage for view models and utilities.",
    ],
    impact: [
      "New feature work happens in SwiftUI while the UIKit app keeps shipping — no rewrite, no freeze.",
      "Concurrent-refresh races removed at the data layer rather than patched at the call site.",
      "View models are covered by XCTest because the presentation logic never lived in a view.",
    ],
    tech: [
      "Swift",
      "SwiftUI",
      "UIKit",
      "MVVM + Coordinators",
      "Swift Concurrency",
      "Apollo GraphQL",
      "Firebase",
      "SDWebImage",
      "Avo",
      "Braze",
      "XCTest",
    ],
  },
  {
    slug: "caloer",
    name: "Caloer",
    tagline:
      "A calorie, macro and workout tracker built around Vietnamese food — 4.7★ from nearly 5,000 ratings.",
    role: "Full-Stack Developer",
    period: "01/2025 – 06/2025",
    context: "Personal product · live on the App Store and Google Play",
    featured: true,
    accent: "#4ec98a",
    deviceKind: "iphone",
    screenCount: 5,
    links: {
      appStore:
        "https://apps.apple.com/vn/app/caloer-t%C3%ADnh-calo-gi%E1%BA%A3m-c%C3%A2n/id6474173293",
      appleId: "6474173293",
      storefront: "vn",
      // TODO(long): add the Google Play URL — the CV cites 100K+ installs there.
    },
    /*
     * Shots 1–2 are tilted multi-device mockups, and shot 3 has floating
     * callout cards that sit *outside* the phone, so cropping to the screen
     * slices them in half. Shots 4–8 are a clean upright phone on one template.
     *
     * The rect is measured from the device body — its left/right edges are
     * identical across the set at x[167..1069] — and the height derived from a
     * real iPhone's 0.4613 screen aspect rather than eyeballed, which is what
     * a first pass got wrong by ~50px and clipped the UI with.
     */
    screenIndices: [3, 4, 5, 6, 7],
    screenCrop: { x: 0.1431, y: 0.1797, w: 0.7138, h: 0.7121 },
    metrics: [
      { value: "4.7★", label: "From 4,900+ ratings" },
      { value: "100K+", label: "Google Play downloads" },
      { value: "36K+", label: "iOS downloads" },
    ],
    problem:
      "Every calorie tracker on the market is built on a Western food database. For Vietnamese users that means logging a bowl of bún bò as a rough guess — the food they actually eat simply isn't in the app.",
    approach: [
      "Built an extensive Vietnamese food library with detailed nutritional breakdowns, searchable through Elasticsearch so lookup stays fast as the library grows.",
      "Developed personalised, goal-based meal and workout recommendations driven by each user's weight target.",
      "Implemented calorie, macro and progress tracking with data visualisation.",
      "Built levelled workout programmes so users don't have to assemble a routine themselves.",
      "Implemented in-app purchases for the premium tier across both stores.",
      "Ship regular performance and bug-fix releases on iOS and Android.",
    ],
    impact: [
      "4.7 out of 5 from more than 4,900 App Store ratings.",
      "Past 100,000 downloads on Google Play and 36,000 on iOS.",
      "Revenue-generating through a premium in-app purchase tier.",
      "Owned end to end — Spring Boot backend, React Native client, and every store release.",
    ],
    tech: [
      "Spring Boot",
      "React Native",
      "RTK Query",
      "Elasticsearch",
      "MySQL",
      "In-app purchases",
    ],
  },
  {
    slug: "video-streaming",
    name: "Streaming Video Player",
    tagline: "A video app with a player built from scratch to the design spec.",
    role: "Mobile Developer",
    period: "06/2023 – 12/2023",
    context: "Mobile app for streaming video playback",
    featured: false,
    accent: "#a78bfa",
    deviceKind: "iphone",
    screenCount: 0,
    links: {},
    metrics: [],
    problem:
      "The product needed a player that matched an exact design spec — which ruled out every off-the-shelf component's default chrome.",
    approach: [
      "Implemented real-time video stream rendering.",
      "Customised the player to the design specification, including controls, scrubbing and playback states.",
    ],
    impact: ["Shipped a player that matched the design rather than the library's defaults."],
    tech: ["React Native", "JavaScript", "Video streaming", "React Context", "Jest", "MUI", "Figma"],
  },
  {
    slug: "resident-management",
    name: "Resident Management System",
    tagline: "QR-code access control for people entering and leaving controlled areas.",
    role: "Mobile Developer",
    period: "01/2023 – 05/2023",
    context: "QR-code system for managing controlled-area access",
    featured: false,
    accent: "#60a5fa",
    deviceKind: "iphone",
    screenCount: 0,
    links: {},
    metrics: [],
    problem:
      "Controlled sites needed a reliable record of who entered and left, on hardware that had to be provisioned in the field.",
    approach: [
      "Built device initialisation and QR-code scanning flows.",
      "Implemented user authentication and real-time chat over Socket.IO.",
    ],
    impact: ["Delivered scanning, auth and messaging in a five-month engagement."],
    tech: [
      "React Native",
      "ReactJS",
      "NodeJS",
      "Firebase",
      "Socket.IO",
      "AWS S3",
      "MongoDB",
      "Unit testing",
    ],
  },
  {
    slug: "apartment-management",
    name: "Apartment Management Platform",
    tagline: "Building services for administrators and tenants, with a shared design system.",
    role: "Full-Stack Developer",
    period: "01/2022 – 12/2022",
    context: "Platform for managing apartment building services",
    featured: false,
    accent: "#f472b6",
    deviceKind: "ipad",
    screenCount: 0,
    links: {},
    metrics: [],
    problem:
      "Administrators and tenants need the same platform to show them very different things — and the two interfaces had to stay visually coherent as both grew.",
    approach: [
      "Designed the database schema, the design system and a shared UI component library.",
      "Implemented authentication and bulk upload.",
      "Built role-based web interfaces for both the admin and tenant sides.",
    ],
    impact: [
      "One component library served both roles, so the two interfaces stayed consistent as they diverged in function.",
    ],
    tech: [
      "Java Spring Boot",
      "ReactJS",
      "NodeJS",
      "AWS EC2",
      "AWS Elastic Beanstalk",
      "MySQL stored procedures",
      "MongoDB",
    ],
  },
  {
    slug: "healthy-living",
    name: "Healthy Living Everyday",
    tagline: "An IoT recommendation engine reading workouts off a Mi Band.",
    role: "Full-Stack Developer",
    period: "06/2021 – 12/2021",
    context: "IoT project — workouts recorded with Mi Band smartwatches",
    featured: false,
    accent: "#34d399",
    deviceKind: "iphone",
    screenCount: 0,
    links: {},
    metrics: [],
    problem:
      "Wearable data is only useful if something acts on it — a step count on its own doesn't tell anyone what to eat or train next.",
    approach: [
      "Built a recommendation engine that reads Mi Band data and suggests foods and exercises matched to a weight-gain or weight-loss goal.",
      "Analysed the collected data and designed the scoring formulas that rank recommendations by priority.",
      "Wrote native modules to bridge the Xiaomi plugin into React Native.",
    ],
    impact: ["Turned raw wearable telemetry into ranked, goal-aware recommendations."],
    tech: [
      "React Native",
      "NodeJS",
      "Xiaomi plugin",
      "Native modules",
      "Firebase",
      "MongoDB",
    ],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
