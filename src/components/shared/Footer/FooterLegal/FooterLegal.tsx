import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Link } from "react-router";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { LEGAL_LINKS } from "../Footer.constants";

export const FooterLegal = () => {
  const { i18n } = useLingui();

  return (
    <nav
      aria-label={t`Nawigacja w stopce`}
      className="order-1 flex flex-wrap justify-center gap-6 text-base leading-4.75 text-gi-primary md:order-2 md:justify-end"
    >
      {LEGAL_LINKS.map((link) => (
        <Link key={link.href} to={link.href} className={FOCUS_CLASS_NAME}>
          {i18n._(link.label)}
        </Link>
      ))}
    </nav>
  );
};
