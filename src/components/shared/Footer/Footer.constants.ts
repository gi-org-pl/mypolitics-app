import { msg } from '@lingui/core/macro';
import { PATHS } from '@/constants/paths';
import type { LinkItem, SocialLink } from './Footer.types';

export const LEGAL_LINKS: LinkItem[] = [
    { label: msg`Regulamin`,  href: PATHS.terms },
    { label: msg`Prywatność`, href: PATHS.privacy },
    { label: msg`O nas`,      href: PATHS.about },
]

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'facebook',  href: 'https://facebook.com/myPoliticsTest', ariaLabel: msg`Facebook` },
  { platform: 'x',         href: 'https://x.com/myPolitics__', ariaLabel: msg`X (Twitter)` },
  { platform: 'instagram', href: 'https://www.instagram.com/mypolitics_/', ariaLabel: msg`Instagram` },
  { platform: 'linkedin',  href: 'https://www.linkedin.com/company/mypolitics', ariaLabel: msg`LinkedIn` },
  { platform: 'telegram',  href: 'https://t.me/mypoliticsofficial', ariaLabel: msg`Telegram` },
  { platform: 'github',    href: 'https://github.com/mypolitics', ariaLabel: msg`GitHub` },
  { platform: 'youtube',   href: 'https://www.youtube.com/myPolitics', ariaLabel: msg`YouTube` },
];