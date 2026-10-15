import { PATHS } from "@/constants/paths";

// Where the sign-in page sends a person once they are in: the next address
// it was given, if that is a path inside the app, and the home page
// otherwise. Nothing that leaves the app - another site, "//host", a scheme
// - and not the sign-in page itself.
export const toSafeNextPath = (next: string | null): string => {
  if (
    !next?.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  ) {
    return PATHS.home;
  }

  const url = new URL(next, "https://app.invalid");

  if (url.origin !== "https://app.invalid" || url.pathname === PATHS.signIn()) {
    return PATHS.home;
  }

  return `${url.pathname}${url.search}${url.hash}`;
};
