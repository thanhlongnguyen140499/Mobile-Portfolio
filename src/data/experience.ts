export type Role = {
  title: string;
  period: string;
  /** Start date as ISO-ish, for sorting and <time> elements. */
  start: string;
  end: string | null;
  subject: string;
  bullets: string[];
  tech: string[];
  /** Links the timeline row to its case study, when one exists. */
  projectSlug?: string;
};

export const experience: Role[] = [
  {
    title: "iOS Developer",
    period: "01/2026 – Present",
    start: "2026-01",
    end: null,
    subject:
      "The Philadelphia Inquirer — iOS news app modernisation programme (client engagement)",
    bullets: [
      "Built SwiftUI feature modules on MVVM (ObservableObject + @Published) — kept presentation logic out of views and fully unit-testable.",
      "Adopted Swift Concurrency (async/await, Task, @MainActor) across the data layer, eliminating race conditions on concurrent refresh.",
      "Built reusable @ViewBuilder component libraries with adaptive iPhone/iPad layouts and a shared dark-mode token system.",
      "Reduced redundant network calls via cursor pagination and response/image caching; added shimmer placeholders for perceived performance.",
      "Bridged SwiftUI into a 380-file UIKit codebase via UIHostingController; instrumented typed analytics and XCTest coverage for view models.",
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
    projectSlug: "philadelphia-inquirer",
  },
  {
    title: "Web & Mobile Developer → Front End Developer",
    period: "01/2024 – 12/2025",
    start: "2024-01",
    end: "2025-12",
    subject:
      "Real-estate management, leasing and sales platform — published on App Store & Google Play",
    bullets: [
      "Built property search with multi-criteria filters, user authentication, in-app chat, and bulk file/image upload.",
      "Implemented contact sync (Google & Microsoft), Google Maps integration, and Stripe payments.",
      "Migrated data fetching to RTK Query and set up CI/CD release automation with Fastlane, shortening merge-to-store time.",
      "Designed responsive layouts for desktop, tablet and mobile breakpoints; ran usability testing to drive improvements.",
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
    projectSlug: "wispr-network",
  },
  {
    title: "Full-Stack Developer (Personal Product)",
    period: "01/2025 – 06/2025",
    start: "2025-01",
    end: "2025-06",
    subject:
      "Caloer — calorie, macro and fitness tracking app · 100K+ downloads on Google Play, 36K+ on iOS",
    bullets: [
      "Built and maintain a nutrition & fitness tracker with personalised goal-based meal and workout recommendations.",
      "Developed extensive Vietnamese food library with detailed nutritional breakdowns; calorie/macro tracking + data visualisation.",
      "Implemented in-app purchases for the premium tier; ship regular performance and bug-fix releases on both stores.",
    ],
    tech: [
      "Spring Boot",
      "React Native",
      "RTK Query",
      "Elasticsearch",
      "MySQL",
      "In-app purchases",
    ],
    projectSlug: "caloer",
  },
  {
    title: "Mobile Developer",
    period: "06/2023 – 12/2023",
    start: "2023-06",
    end: "2023-12",
    subject: "Mobile app for streaming video playback with a custom-built player",
    bullets: [
      "Implemented real-time video stream rendering and customised the player (controls, scrubbing, playback states) to design specs.",
    ],
    tech: ["React Native", "JavaScript", "Video streaming", "React Context", "Jest", "MUI", "Figma"],
    projectSlug: "video-streaming",
  },
  {
    title: "Mobile Developer — Resident Management System",
    period: "01/2023 – 05/2023",
    start: "2023-01",
    end: "2023-05",
    subject: "QR-code system for managing people entering and leaving controlled areas",
    bullets: [
      "Built device initialisation and QR-code scanning flows; implemented user authentication and real-time chat.",
    ],
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
    projectSlug: "resident-management",
  },
  {
    title: "Full-Stack Developer — Apartment Management System",
    period: "01/2022 – 12/2022",
    start: "2022-01",
    end: "2022-12",
    subject: "Platform for managing apartment building services for administrators and tenants",
    bullets: [
      "Designed database schema, design system and shared UI component library; implemented authentication, bulk upload and role-based web interfaces.",
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
    projectSlug: "apartment-management",
  },
  {
    title: "Full-Stack Developer — Healthy Living Everyday",
    period: "06/2021 – 12/2021",
    start: "2021-06",
    end: "2021-12",
    subject: "IoT project — users record workouts with Mi Band smartwatches",
    bullets: [
      "Built recommendation engine that reads Mi Band data and suggests foods/exercises matched to weight-gain or weight-loss goals; designed scoring formulas.",
    ],
    tech: [
      "React Native",
      "NodeJS",
      "Xiaomi plugin",
      "Native modules",
      "Firebase",
      "MongoDB",
    ],
    projectSlug: "healthy-living",
  },
];
