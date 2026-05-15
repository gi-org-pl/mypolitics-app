import React from 'react';
import { FooterLeft } from './FooterLeft/FooterLeft';
import { FooterSocials } from './FooterSocials/FooterSocials';
import { FooterLegal } from './FooterLegal/FooterLegal';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-background border-t border-border py-6 px-4 md:py-8 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between items-center md:items-start gap-6 md:gap-8">
        <FooterLeft />
        <div className="flex flex-col items-center md:items-end gap-6 md:gap-4">
          <FooterSocials />
          <FooterLegal />
        </div>
      </div>
    </footer>
  );
};