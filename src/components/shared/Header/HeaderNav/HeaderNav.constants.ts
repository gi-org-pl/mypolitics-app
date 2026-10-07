import { msg } from "@lingui/core/macro";
import debatesIcon from "@/assets/vectors/debates-icon.svg";
import pollsIcon from "@/assets/vectors/polls-icon.svg";
import quizzesIcon from "@/assets/vectors/quizzes-icon.svg";
import { PATHS } from "@/constants/paths";
import type {
  HeaderNavEntry,
  HeaderNavLook,
  HeaderNavVariant,
} from "./HeaderNav.types";

export const HEADER_NAV_ENTRIES: HeaderNavEntry[] = [
  {
    key: "debates",
    label: msg`Debaty`,
    path: PATHS.debates,
    icon: debatesIcon,
    iconClassName: "h-2.75 w-4",
  },
  {
    key: "polls",
    label: msg`Sondaże`,
    path: PATHS.polls,
    icon: pollsIcon,
    iconClassName: "h-3 w-4",
  },
  {
    key: "quizzes",
    label: msg`Quizy`,
    path: PATHS.quizzes,
    icon: quizzesIcon,
    iconClassName: "h-3.5 w-4.75",
  },
];

export const HEADER_NAV_LOOKS: Record<HeaderNavVariant, HeaderNavLook> = {
  bar: {
    className: "hidden gap-3 md:flex",
    entries: HEADER_NAV_ENTRIES,
  },
  menu: {
    className:
      "absolute top-full left-0 z-50 mt-px flex w-full flex-col gap-3 border-b border-[#d4e1e4] bg-white px-3.75 py-6 md:hidden",
    entries: [...HEADER_NAV_ENTRIES].reverse(),
  },
};
