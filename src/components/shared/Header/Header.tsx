import { Button } from "@gi/athena";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import debatesIcon from "@/assets/vectors/debates-icon.svg";
import hamburgerIcon from "@/assets/vectors/hamburger-menu.svg";
import logo from "@/assets/vectors/logo.svg";
import pollsIcon from "@/assets/vectors/polls-icon.svg";
import quizzesIcon from "@/assets/vectors/quizzes-icon.svg";
import { PATHS } from "@/constants/paths";

import { HEADER_NAV_ITEMS, MOBILE_HEADER_NAV_ITEMS } from "./Header.constants";
import type { HeaderNavItem } from "./Header.types";

const icons: Record<HeaderNavItem["key"], string> = {
  debates: debatesIcon,
  polls: pollsIcon,
  quizzes: quizzesIcon,
};

const HeaderLabel = ({ label }: Pick<HeaderNavItem, "label">) => {
  if (label === "Debaty") return <Trans>Debaty</Trans>;
  if (label === "Sondaże") return <Trans>Sondaże</Trans>;
  if (label === "Quizy") return <Trans>Quizy</Trans>;
  return <>{label}</>;
};

const Header: React.FC = () => {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !hamburgerRef.current?.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderNavItem = (item: HeaderNavItem, isMobile = false) => {
    const isActive = !item.external && pathname === item.path;

    const icon = (
      <img
        src={icons[item.key]}
        alt=""
        className={isActive ? "brightness-0 invert" : undefined}
      />
    );

    const link = item.external ? (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setIsMenuOpen(false)}
      >
        <HeaderLabel label={item.label} />
      </a>
    ) : (
      <NavLink
        to={item.path}
        aria-current={isActive ? "page" : undefined}
        onClick={() => setIsMenuOpen(false)}
      >
        <HeaderLabel label={item.label} />
      </NavLink>
    );

    return (
      <Button
        key={item.key}
        asChild
        type={isActive ? "primary" : "ghost"}
        variant="primary"
        size="regular"
        className={
          isMobile
            ? "w-full max-w-[290px] text-sm font-bold leading-none"
            : "w-fit text-base font-bold leading-none"
        }
        LeftIcon={icon}
      >
        {link}
      </Button>
    );
  };

  return (
    <header className="relative border-b border-gi-dark-ash bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-6">
        <Link to={PATHS.home} aria-label={t`Strona główna`}>
          <img src={logo} alt="myPolitics" className="h-6" />
        </Link>

        <nav data-testid="desktopNav" className="hidden gap-4 md:flex">
          {HEADER_NAV_ITEMS.map((item) => renderNavItem(item))}
        </nav>

        <Button
          ref={hamburgerRef}
          type="ghost"
          variant="primary"
          size="regular"
          isIconButton
          className="bg-transparent hover:bg-transparent md:hidden"
          aria-label={
            isMenuOpen ? t`Zamknij menu nawigacji` : t`Otwórz menu nawigacji`
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <img src={hamburgerIcon} alt="" />
        </Button>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          ref={menuRef}
          data-testid="mobileMenu"
          className="absolute left-0 top-full z-50 flex w-full flex-col items-center gap-3 border-b border-gi-dark-ash bg-white p-4 shadow-md md:hidden"
        >
          {MOBILE_HEADER_NAV_ITEMS.map((item) => renderNavItem(item, true))}
        </div>
      )}
    </header>
  );
};

export default Header;
