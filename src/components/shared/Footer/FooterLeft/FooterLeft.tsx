import React from 'react';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { PATHS } from '@/constants/paths';
import myPoliticsLogo from '@/assets/icons/mypoliticslogo.svg';
import giLogo from '@/assets/icons/gilogo.svg';

export const FooterLeft: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-row items-center justify-center md:justify-start gap-3 md:gap-4 h-6">
      <span className="text-base leading-6 text-gi-gray whitespace-nowrap flex items-center">
        {i18n._(msg`© ${currentYear}`)}
      </span>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <img
        src={myPoliticsLogo}
        alt={i18n._(msg`myPolitics`)}
        className="h-6 w-auto"
      />
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <a
        href={PATHS.generacjaInnowacja}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center h-6"
      >
        <img
          src={giLogo}
          alt={i18n._(msg`Generacja Innowacja`)}
          className="h-6 w-auto"
        />
      </a>
    </div>
  );
};
