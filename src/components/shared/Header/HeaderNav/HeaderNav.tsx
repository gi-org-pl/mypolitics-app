import { t } from "@lingui/core/macro";
import { useLocation } from "react-router";
import { HEADER_NAV_LOOKS } from "./HeaderNav.constants";
import type { HeaderNavProps } from "./HeaderNav.types";
import { HeaderNavItem } from "./HeaderNavItem/HeaderNavItem";

export const HeaderNav = ({ variant, onNavigate, id, ref }: HeaderNavProps) => {
  const { pathname } = useLocation();
  const { className, entries } = HEADER_NAV_LOOKS[variant];

  return (
    <nav
      ref={ref}
      id={id}
      aria-label={t`Nawigacja główna`}
      className={className}
    >
      {entries.map((entry) => (
        <HeaderNavItem
          key={entry.key}
          entry={entry}
          isActive={pathname === entry.path}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
};
