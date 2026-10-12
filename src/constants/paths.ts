export const PATHS = {
  generacjaInnowacja: "https://gi.org.pl",
  terms: "/terms",
  privacy: "/privacy",
  about: "/about",
  home: "/",
  quizzes: "/quizzes",
  quiz: (slug: string) => `/quizzes/${encodeURIComponent(slug)}`,
  debates: "/debates",
  polls: "https://polls.mypolitics.pl", // external
  whitepaperPDF: "https://mypolitics.pl/static/whitepaper.pdf", // external
} as const;
