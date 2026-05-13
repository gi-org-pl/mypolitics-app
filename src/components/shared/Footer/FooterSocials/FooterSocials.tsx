import React from 'react';
import { i18n } from '@lingui/core';
import { SOCIAL_LINKS } from '../Footer.constants.ts';

export const FooterSocials: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 max-w-[208px] md:max-w-none md:flex-nowrap order-2 md:order-1">
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.platform}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={i18n._(social.ariaLabel)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gi-ash hover:bg-gi-ash-hover transition-colors"
        >
          <img
            src={new URL(`../../../../assets/icons/${social.platform}logo.svg`, import.meta.url).href}
            alt=""
            className="w-5 h-5"
          />
        </a>
      ))}
    </div>
  );
};
