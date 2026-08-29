export type SkillGroup = {
  label: string;
  items: string[];
};

/** Grouped exactly as the CV groups them. */
export const skillGroups: SkillGroup[] = [
  {
    label: "Mobile",
    items: [
      "Swift",
      "SwiftUI",
      "UIKit",
      "Swift Concurrency",
      "React Native",
      "Fastlane",
      "Hot Update",
    ],
  },
  {
    label: "Web",
    items: [
      "ReactJS",
      "NextJS",
      "TypeScript",
      "JavaScript",
      "HTML/CSS/SCSS",
      "Tailwind CSS",
    ],
  },
  {
    label: "Backend",
    items: ["Node.js", "Spring Boot (Java)", "GraphQL (Apollo)", "REST", "Socket.IO"],
  },
  {
    label: "Data",
    items: ["MySQL/SQL", "MongoDB", "Elasticsearch", "Firebase", "Redux / RTK Query"],
  },
  {
    label: "Cloud & CI",
    items: [
      "AWS (EC2, S3, Elastic Beanstalk)",
      "Firebase",
      "Fastlane",
      "CI/CD pipelines",
    ],
  },
  {
    label: "Testing",
    items: ["XCTest", "Jest", "Vitest", "Unit testing", "Usability testing"],
  },
  {
    label: "Practices",
    items: [
      "MVVM",
      "Coordinator pattern",
      "System design",
      "API integration",
      "Agile",
      "Figma",
    ],
  },
];

/**
 * Normalises a skill label so a chip can match the (differently worded) tech
 * lists on projects — "Node.js" on a skill vs "NodeJS" on a project, and so on.
 */
export function skillKey(s: string) {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const ALIASES: Record<string, string> = {
  nodejs: "nodejs",
  node: "nodejs",
  springbootjava: "springboot",
  springboot: "springboot",
  graphqlapollo: "graphql",
  apollographql: "graphql",
  reduxrtkquery: "rtkquery",
  rtkquery: "rtkquery",
  mysqlsql: "mysql",
  mysqlstoredprocedures: "mysql",
  mysql: "mysql",
  htmlcssscss: "css",
  tailwindcss: "tailwindcss",
  awsec2s3elasticbeanstalk: "aws",
  awsec2: "aws",
  awss3: "aws",
  awselasticbeanstalk: "aws",
  cicdpipelines: "fastlane",
  unittesting: "unittesting",
  mvvmcoordinators: "mvvm",
  mvvm: "mvvm",
  coordinatorpattern: "mvvm",
};

export function canonicalSkill(s: string) {
  const k = skillKey(s);
  return ALIASES[k] ?? k;
}
