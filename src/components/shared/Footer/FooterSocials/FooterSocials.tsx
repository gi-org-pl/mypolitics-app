import React from 'react';
import { i18n } from '@lingui/core';
import { SOCIAL_LINKS } from '../Footer.constants.ts';
import { Button } from '@gi/athena';

export const FooterSocials: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-center gap-3 max-w-[208px] md:max-w-none md:flex-nowrap order-2 md:order-1">
      {SOCIAL_LINKS.map((social) => (
        <Button
          key={social.platform}
          asChild
          isIconButton
          type="ghost"
          variant="primary"
          size="regular"
          className="rounded-full"
        >
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={i18n._(social.ariaLabel)}
          >
            <img
              src={new URL(`../../../../assets/icons/${social.platform}logo.svg`, import.meta.url).href}
              alt={`${social.platform} logo`}
              className="h-4 w-auto"
            />
          </a>
        </Button>
      ))}
    </div>
  );
};
