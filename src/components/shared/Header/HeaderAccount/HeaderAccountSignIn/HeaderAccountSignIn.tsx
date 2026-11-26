import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import { Link, useLocation } from "react-router";

import {
  HEADER_PILL_ACTIVE_CLASS_NAME,
  HEADER_PILL_CLASS_NAME,
  HEADER_PILL_IDLE_CLASS_NAME,
} from "@/constants/header";
import { PATHS } from "@/constants/paths";

import type { HeaderAccountSignInProps } from "./HeaderAccountSignIn.types";

// The sign-in pill: a link to the sign-in page that brings the person back to
// the page they were on. It is drawn like the navigation pills, filled while
// the sign-in page is open; there it stays on that page as it is, so the page
// the person came from is kept.
export const HeaderAccountSignIn = ({
  className = "",
  onNavigate,
}: HeaderAccountSignInProps) => {
  const { t } = useLingui();
  const { pathname, search, hash } = useLocation();
  const isActive = pathname === PATHS.signIn();
  const here = `${pathname}${search}${hash}`;

  return (
    <Button
      asChild
      type={isActive ? "primary" : "ghost"}
      variant="primary"
      size="regular"
      className={`${HEADER_PILL_CLASS_NAME} ${
        isActive ? HEADER_PILL_ACTIVE_CLASS_NAME : HEADER_PILL_IDLE_CLASS_NAME
      } ${className}`}
    >
      <Link
        to={isActive ? here : PATHS.signIn(here)}
        replace={isActive}
        aria-current={isActive ? "page" : undefined}
        onClick={onNavigate}
      >
        {t`Zaloguj się`}
      </Link>
    </Button>
  );
};
