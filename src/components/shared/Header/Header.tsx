import { Button } from "@gi-org-pl/athena";
import { t } from "@lingui/core/macro";
import { Link } from "react-router";
import hamburgerIcon from "@/assets/vectors/hamburger-menu.svg";
import logo from "@/assets/vectors/mypoliticslogo-light.svg";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { PATHS } from "@/constants/paths";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";
import { HeaderNav } from "./HeaderNav/HeaderNav";
import { useHeaderMenu } from "./utils/useHeaderMenu";

export const Header = () => {
  const { menuId, isOpen, menuRef, buttonRef, toggle, close } = useHeaderMenu();

  return (
    <header className="relative w-full border-b border-[#d4e1e4] bg-white">
      <div className="mx-auto box-content flex max-w-300 items-center justify-between px-8 py-6">
        <Link
          to={PATHS.home}
          aria-label={t`Strona główna`}
          className={FOCUS_CLASS_NAME}
        >
          <img src={logo} alt="" className="h-6" />
        </Link>

        <HeaderNav variant="bar" onNavigate={close} />

        <Button
          ref={buttonRef}
          type="ghost"
          variant="primary"
          size="regular"
          isIconButton
          className={`-my-2 -mr-2.5 w-auto bg-transparent px-2.5 hover:bg-transparent md:hidden ${FOCUS_CLASS_NAME}`}
          aria-label={
            isOpen ? t`Zamknij menu nawigacji` : t`Otwórz menu nawigacji`
          }
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={toggle}
        >
          <span
            className={`${BUTTON_ICON_MASK_CLASS_NAME} h-4.75 w-5.25 mask-contain`}
            style={getIconMaskStyle(hamburgerIcon)}
          />
        </Button>
      </div>

      {isOpen && (
        <HeaderNav
          ref={menuRef}
          id={menuId}
          variant="menu"
          onNavigate={close}
        />
      )}
    </header>
  );
};
