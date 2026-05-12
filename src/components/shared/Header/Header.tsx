import { Button } from "@gi/athena";
import React, { useEffect, useRef, useState } from "react";
import { PATHS } from "@/constants/paths";
import { Link } from "react-router";
import { Trans } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';


export const Header: React.FC = () => {
  const [activeButton, setActiveButton] = useState("debaty");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

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

    return () => {
      document.removeEventListener("mousedown", clickOutsideMenu);
    };
  }, []);

  return (
    <header className="relative">
      <div className="flex justify-between items-center m-8">
        <Link to = {PATHS.home}>
          <img src="src/assets/vectors/logo.svg" />
        </Link>
        

        <nav className="hidden md:flex gap-4">

          <Link to = {PATHS.debates}>
            <Button type={activeButton === "debaty" ? "primary" : "ghost"} onClick={() => buttonClick("debaty")}>
              <img src="src/assets/vectors/debaty_icon.svg"
                className={activeButton === "debaty" ? "brightness-0 invert" : ""}
              />
              <Trans>Debaty</Trans>
            </Button>
          </Link>
          
          <Link to = {PATHS.polls}>
            <Button type={activeButton === "sondaze" ? "primary" : "ghost"} onClick={() => buttonClick("sondaze")}>
              <img src="src/assets/vectors/sondaze_icon.svg"
                className={
                  activeButton === "sondaze" ? "brightness-0 invert" : ""
                }
              />
              <Trans>Sondaże</Trans>
            </Button>
          </Link>

          <Link to = {PATHS.quizzes}>
            <Button type={activeButton === "quizy" ? "primary" : "ghost"} onClick={() => buttonClick("quizy")}>
              <img src="src/assets/vectors/quizy_icon.svg"
                className={activeButton === "quizy" ? "brightness-0 invert" : ""}
              />
              <Trans>Quizy</Trans>
            </Button>
          </Link>

        </nav>

        <button
          className="md:hidden text-3xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <img src="src/assets/vectors/hamburger-menu.svg" />
        </button>
      </div>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col gap-2 p-4 md:hidden z-50"
        >
          <Link to = {PATHS.quizzes}>
            <Button type={activeButton === "quizy" ? "primary" : "ghost"} onClick={() => buttonClick("quizy")}>
              <img src="src/assets/vectors/quizy_icon.svg"
                className={activeButton === "quizy" ? "brightness-0 invert" : ""}
              />
              <Trans>Quizy</Trans>
            </Button>
          </Link>

          <Link to = {PATHS.polls}>
            <Button type={activeButton === "sondaze" ? "primary" : "ghost"} onClick={() => buttonClick("sondaze")}>
              <img src="src/assets/vectors/sondaze_icon.svg"
                className={
                  activeButton === "sondaze" ? "brightness-0 invert" : ""
                }
              />
              <Trans>Sondaże</Trans>
            </Button>
          </Link>

          <Link to = {PATHS.debates}>
            <Button type={activeButton === "debaty" ? "primary" : "ghost"} onClick={() => buttonClick("debaty")}>
              <img src="src/assets/vectors/debaty_icon.svg"
                className={activeButton === "debaty" ? "brightness-0 invert" : ""}
              />
              <Trans>Debaty</Trans>
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;