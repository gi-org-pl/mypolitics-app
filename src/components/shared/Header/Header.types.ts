import type { AuthSession } from "@/types/auth";

export type HeaderProps = {
  // The route of the page the header is on. Each route is a view of its own:
  // the logo plays its animation on the first visit of each in the session.
  routeId?: string;
};

export type HeaderStoryProps = HeaderProps & {
  initialPath: string;
  session?: AuthSession; // unknown by default: the account place is empty
};
