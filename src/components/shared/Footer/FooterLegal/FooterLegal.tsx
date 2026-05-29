import { i18n } from "@lingui/core";
import React from "react";
import { Link } from "react-router";
import { LEGAL_LINKS } from "../Footer.constants";

export const FooterLegal: React.FC = () => {
  return (
    <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm leading-[19px] order-1 md:order-2">
      {LEGAL_LINKS.map((link) => (
        <div key={link.href} className="flex items-center">
          <Link to={link.href} className="text-chart-3 text-gi-primary">
            {i18n._(link.label)}
          </Link>
        </div>
      ))}
    </nav>
  );
};
