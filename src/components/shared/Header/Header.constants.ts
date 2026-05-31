import { msg } from "@lingui/core/macro";
import { PATHS } from "@/constants/paths";
import type { HeaderNavItem } from "./Header.types";

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  {
    key: "debates",
    label: msg`Debaty`,
    path: PATHS.debates,
  },
  {
    key: "polls",
    label: msg`Sondaże`,
    path: PATHS.polls,
  },
  {
    key: "quizzes",
    label: msg`Quizy`,
    path: PATHS.quizzes,
  },
];
