import React from 'react';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { PATHS } from '@/constants/paths';
import myPoliticsLogo from '@/assets/icons/mypoliticslogo.svg';
import giLogo from '@/assets/icons/gilogo.svg';

export const FooterLeft: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-row items-center justify-center md:justify-start gap-2">
      <span className="text-base leading-6 text-gi-gray whitespace-nowrap flex items-center">
        {i18n._(msg`© ${currentYear}`)}
      </span>
      <div className="w-px h-3 bg-current text-gi-gray shrink-0" />
      <img
        src={myPoliticsLogo}
        alt={i18n._(msg`myPolitics`)}
        className="h-4 w-auto"
        data-testid="footer-mypolitics-logo"
      />
      <div className="w-px h-3 bg-current text-gi-gray shrink-0" />
      <a
        href={PATHS.generacjaInnowacja}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center h-4"
      >
        <img
          src={giLogo}
          alt={i18n._(msg`Generacja Innowacja`)}
          className="h-4 w-auto"
        />
      </a>
    </div>
  );
};
