import { Button } from "@gi/athena";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import debatesIcon from "@/assets/vectors/debates-icon.svg";
import hamburgerIcon from "@/assets/vectors/hamburger-menu.svg";
import logo from "@/assets/vectors/mypoliticslogo-light.svg";
import pollsIcon from "@/assets/vectors/polls-icon.svg";
import quizzesIcon from "@/assets/vectors/quizzes-icon.svg";
import { PATHS } from "@/constants/paths";
import { HEADER_NAV_ITEMS } from "./Header.constants";
import type { HeaderNavItem } from "./Header.types";

const icons: Record<HeaderNavItem["key"], string> = {
  debates: debatesIcon,
  polls: pollsIcon,
  quizzes: quizzesIcon,
};

export const Header: React.FC = () => {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { i18n } = useLingui();

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
    const translatedLabel = i18n._(item.label);

    const icon = (
      <span
        aria-hidden="true"
        className="inline-block shrink-0 bg-current"
        style={{
          width: 19,
          height: 14,
          mask: `url("${icons[item.key]}") center / contain no-repeat`,
          WebkitMask: `url("${icons[item.key]}") center / contain no-repeat`,
        }}
      />
    );

    const link = item.external ? (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setIsMenuOpen(false)}
      >
        {translatedLabel}
      </a>
    ) : (
      <NavLink
        to={item.path}
        aria-current={isActive ? "page" : undefined}
        onClick={() => setIsMenuOpen(false)}
      >
        {translatedLabel}
      </NavLink>
    );

    return (
      <Button
        key={item.key}
        asChild
        type={isActive ? "primary" : "ghost"}
        variant="primary"
        size="regular"
        className={`${
          isMobile ? "w-full text-sm" : "w-fit text-base"
        } font-bold leading-none ${isActive ? "text-white" : "text-gi-light-primary"}`}
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
          <img src={logo} alt="" className="h-6" />
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
          {[...HEADER_NAV_ITEMS]
            .reverse()
            .map((item) => renderNavItem(item, true))}
        </div>
      )}
    </header>
  );
};
