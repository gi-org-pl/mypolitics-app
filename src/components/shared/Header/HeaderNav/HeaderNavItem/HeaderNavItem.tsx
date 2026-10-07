import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react";
import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { HeaderNavItemProps } from "./HeaderNavItem.types";

export const HeaderNavItem = ({
  entry,
  isActive,
  onNavigate,
}: HeaderNavItemProps) => {
  const { i18n } = useLingui();

  return (
    <Button
      asChild
      type={isActive ? "primary" : "ghost"}
      variant="primary"
      size="regular"
      className={`px-3 text-base leading-none font-bold ${
        isActive
          ? "bg-gi-light-primary text-white"
          : "bg-gi-light-primary/10 text-gi-light-primary hover:bg-gi-light-primary/20"
      }`}
      LeftIcon={
        <span
          className={`shrink-0 bg-current mask-(--header-icon) mask-contain mask-center mask-no-repeat ${entry.iconClassName}`}
          style={{ "--header-icon": `url("${entry.icon}")` } as CSSProperties}
        />
      }
    >
      <Link
        to={entry.path}
        target={entry.external ? "_blank" : undefined}
        rel={entry.external ? "noopener noreferrer" : undefined}
        aria-current={isActive ? "page" : undefined}
        onClick={onNavigate}
      >
        {i18n._(entry.label)}
      </Link>
    </Button>
  );
};
