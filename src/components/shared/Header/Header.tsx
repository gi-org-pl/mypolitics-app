import { Button } from "@gi/athena";
import { Trans } from "@lingui/react/macro";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { PATHS } from "@/constants/paths";

interface HeaderProps {
  initialActiveButton?: string;
  initialIsMenuOpen?: boolean;
  viewport?: "mobile" | "desktop";
}

const Header: React.FC<HeaderProps> = ({
  initialActiveButton = "quizy",
  initialIsMenuOpen = false,
  viewport = "desktop",
}) => {
  const [activeButton, setActiveButton] = useState(initialActiveButton);
  const [isMenuOpen, setIsMenuOpen] = useState(initialIsMenuOpen);

  useEffect(() => {
    setIsMenuOpen(initialIsMenuOpen);
  }, [initialIsMenuOpen]);

  useEffect(() => {
    setActiveButton(initialActiveButton);
  }, [initialActiveButton]);

  const menuRef = useRef<HTMLDivElement>(null);
  const isMobileView = viewport === "mobile";

  function buttonClick(buttonName: string) {
    setActiveButton(buttonName);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    function clickOutsideMenu(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", clickOutsideMenu);
    return () => document.removeEventListener("mousedown", clickOutsideMenu);
  }, []);

  const NavLinks = () => (
    <>
      <Link to={PATHS.debates}>
        <Button
          type={activeButton === "debaty" ? "primary" : "ghost"}
          onClick={() => buttonClick("debaty")}
        >
          <img
            src="src/assets/vectors/debaty-icon.svg"
            className={activeButton === "debaty" ? "brightness-0 invert" : ""}
            alt=""
          />
          <Trans>Debaty</Trans>
        </Button>
      </Link>
      <Link to={PATHS.polls}>
        <Button
          type={activeButton === "sondaze" ? "primary" : "ghost"}
          onClick={() => buttonClick("sondaze")}
        >
          <img
            src="src/assets/vectors/sondaze-icon.svg"
            className={activeButton === "sondaze" ? "brightness-0 invert" : ""}
            alt=""
          />
          <Trans>Sondaze</Trans>
        </Button>
      </Link>
      <Link to={PATHS.quizzes}>
        <Button
          type={activeButton === "quizy" ? "primary" : "ghost"}
          onClick={() => buttonClick("quizy")}
        >
          <img
            src="src/assets/vectors/quizy-icon.svg"
            className={activeButton === "quizy" ? "brightness-0 invert" : ""}
            alt=""
          />
          <Trans>Quizy</Trans>
        </Button>
      </Link>
    </>
  );

  return (
    <header className="relative border-b bg-white">
      <div className="flex justify-between items-center m-8">
        <Link to={PATHS.home}>
          <img src="src/assets/vectors/logo.svg" alt="logo" />
        </Link>

        <nav data-testid="desktopNav" className={`${isMobileView ? "hidden" : "hidden md:flex"} gap-4`}>
          <NavLinks />
        </nav>

        <button
          className={`${isMobileView ? "block" : "md:hidden"} text-3xl`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <img src="src/assets/vectors/hamburger-menu.svg" alt="menu" />
        </button>
      </div>

      {isMenuOpen && (
        <div data-testid="mobileMenu"
          ref={menuRef}
          className={`absolute top-full left-0 w-full bg-white shadow-md flex flex-col gap-2 p-4 z-50 ${
            isMobileView ? "flex" : "md:hidden"
          }`}
        >
          <NavLinks />
        </div>
      )}
    </header>
  );
};

export default Header;
