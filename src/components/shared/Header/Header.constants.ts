import { PATHS } from "@/constants/paths";
import type { HeaderNavItem } from "./Header.types";

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  {
    key: "debates",
    label: "Debaty",
    path: PATHS.debates,
  },
  {
    key: "polls",
    label: "Sondaże",
    path: PATHS.polls,
    external: true,
  },
  {
    key: "quizzes",
    label: "Quizy",
    path: PATHS.quizzes,
  },
];

export const MOBILE_HEADER_NAV_ITEMS: HeaderNavItem[] = [
  {
    key: "quizzes",
    label: "Quizy",
    path: PATHS.quizzes,
  },
  {
    key: "polls",
    label: "Sondaże",
    path: PATHS.polls,
    external: true,
  },
  {
    key: "debates",
    label: "Debaty",
    path: PATHS.debates,
  },
];
