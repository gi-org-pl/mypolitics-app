import { msg } from "@lingui/core/macro";
import { PATHS } from "@/constants/paths";
import type { LinkItem } from "./FooterLegal.types";

export const LEGAL_LINKS: LinkItem[] = [
  { label: msg`Regulamin`, href: PATHS.terms },
  { label: msg`Prywatność`, href: PATHS.privacy },
  { label: msg`O nas`, href: PATHS.about },
];
