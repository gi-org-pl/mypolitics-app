export const PATHS = {
  generacjaInnowacja: "https://gi.org.pl",
  terms: "/terms",
  privacy: "/privacy",
  about: "/about",
  home: "/",
  // The sign-in page; next is the page to go to once signed in.
  signIn: (next?: string) =>
    next ? `/login?next=${encodeURIComponent(next)}` : "/login",
  quizzes: "/quizzes",
  quiz: (slug: string) => `/quizzes/${encodeURIComponent(slug)}`,
  debates: "/debates",
  polls: "https://polls.mypolitics.pl", // external
  whitepaperPDF: "https://mypolitics.pl/static/whitepaper.pdf", // external
} as const;
