export const profile = {
  name: "Nguyen Thanh Long",
  alternateName: "Edward Nguyen",
  role: "iOS & Mobile Engineer",
  disciplines: ["SwiftUI", "React Native", "Full-Stack"],
  location: "Da Nang, Vietnam",
  relocation: {
    /* Named markets are examples, not a closed set — the copy that renders
       these always leaves the list open-ended. */
    targets: ["Singapore", "Australia"],
    summary: "Singapore, Australia and beyond",
    note: "Open to relocate internationally",
  },
  yearsExperience: 5,

  avatar: { src: "/avatar.jpg", width: 912, height: 1136 },

  /** Verbatim from the Singapore CV. */
  summary:
    "iOS and full-stack mobile engineer with 5 years of experience shipping production apps to the App Store and Google Play. Currently building the SwiftUI feed experience for a daily-use news app serving a major US metropolitan audience. Equally comfortable in Swift/SwiftUI and React Native on the client, and Node.js or Spring Boot on the server. Strong emphasis on unit coverage, performance optimisation, and release quality from a software-testing background.",

  /** Short form for the hero, where the full summary is too long to scan. */
  intro:
    "I build iOS apps in SwiftUI and ship them to the App Store — and I'm just as at home in React Native, Node and Spring Boot when a product needs the whole stack.",

  /* Split so the address never sits in the HTML as a single scrapable string.
     Reassembled at render time by <ObfuscatedEmail>. */
  email: { user: "thanhlong1404vn", domain: "gmail.com" },
  phone: { display: "(+84) 876 484 888", dial: "+84876484888" },

  links: {
    /* No trailing slashes: <Contact> treats a bare "…/in/" as an unset
       placeholder and hides the channel. */
    linkedin: "https://www.linkedin.com/in/long-edward-t-nguyen-925b4a252",
    github: "https://github.com/thanhlongnguyen140499",
    cv: "/cv.pdf",
  },

  languages: [
    { name: "English", level: "Full professional proficiency" },
    { name: "Japanese", level: "Conversational (JLPT N3)" },
    { name: "Vietnamese", level: "Native" },
  ],

  education: [
    {
      school: "Danang University of Science and Technology",
      detail: "Software Engineering",
      date: "01/2021",
    },
    {
      school: "Enclave Bootcamp XIV",
      detail: "Software Engineering Bootcamp — Frontend / Mobile Developer track",
      date: "01/2021",
    },
  ],

  certifications: [
    { name: "JLPT N3 — Japanese Language Proficiency", date: "01/2022" },
    {
      name: "Advanced CSS and Sass: Flexbox, Grid, Animations and More",
      issuer: "Udemy",
      date: "01/2022",
    },
  ],
} as const;

export type Profile = typeof profile;
