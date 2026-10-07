import { msg } from "@lingui/core/macro";
import facebookLogo from "@/assets/icons/facebooklogo.svg";
import githubLogo from "@/assets/icons/githublogo.svg";
import instagramLogo from "@/assets/icons/instagramlogo.svg";
import linkedinLogo from "@/assets/icons/linkedinlogo.svg";
import telegramLogo from "@/assets/icons/telegramlogo.svg";
import xLogo from "@/assets/icons/xlogo.svg";
import youtubeLogo from "@/assets/icons/youtubelogo.svg";
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
    icon: facebookLogo,
    ariaLabel: msg`Odwiedź nasz profil na Facebooku`,
  },
  {
    platform: "x",
    href: "https://x.com/myPolitics__",
    icon: xLogo,
    ariaLabel: msg`Odwiedź nasz profil na X`,
  },
  {
    platform: "instagram",
    href: "https://www.instagram.com/mypolitics_/",
    icon: instagramLogo,
    ariaLabel: msg`Odwiedź nasz profil na Instagramie`,
  },
  {
    platform: "linkedin",
    href: "https://www.linkedin.com/company/mypolitics",
    icon: linkedinLogo,
    ariaLabel: msg`Odwiedź nasz profil na LinkedIn`,
  },
  {
    platform: "telegram",
    href: "https://t.me/mypoliticsofficial",
    icon: telegramLogo,
    ariaLabel: msg`Odwiedź nasz profil na Telegramie`,
  },
  {
    platform: "github",
    href: "https://github.com/mypolitics",
    icon: githubLogo,
    ariaLabel: msg`Odwiedź nasz profil na GitHub`,
  },
  {
    platform: "youtube",
    href: "https://www.youtube.com/myPolitics",
    icon: youtubeLogo,
    ariaLabel: msg`Odwiedź nasz kanał na YouTube`,
  },
];
