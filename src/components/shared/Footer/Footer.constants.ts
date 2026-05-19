import { msg } from "@lingui/core/macro";
import { PATHS } from "@/constants/paths";
import type { LinkItem, SocialLink } from "./Footer.types";

export const LEGAL_LINKS: LinkItem[] = [
  { label: msg`Regulamin`, href: PATHS.terms },
  { label: msg`Prywatność`, href: PATHS.privacy },
  { label: msg`O nas`, href: PATHS.about },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "facebook",
    href: "https://facebook.com/myPoliticsTest",
    ariaLabel: msg`Odwiedź nasz profil na Facebooku`,
  },
  {
    platform: "x",
    href: "https://x.com/myPolitics__",
    ariaLabel: msg`Odwiedź nasz profil na X`,
  },
  {
    platform: "instagram",
    href: "https://www.instagram.com/mypolitics_/",
    ariaLabel: msg`Odwiedź nasz profil na Instagramie`,
  },
  {
    platform: "linkedin",
    href: "https://www.linkedin.com/company/mypolitics",
    ariaLabel: msg`Odwiedź nasz profil na LinkedIn`,
  },
  {
    platform: "telegram",
    href: "https://t.me/mypoliticsofficial",
    ariaLabel: msg`Odwiedź nasz profil na Telegramie`,
  },
  {
    platform: "github",
    href: "https://github.com/mypolitics",
    ariaLabel: msg`Odwiedź nasz profil na GitHub`,
  },
  {
    platform: "youtube",
    href: "https://www.youtube.com/myPolitics",
    ariaLabel: msg`Odwiedź nasz kanał na YouTube`,
  },
];
