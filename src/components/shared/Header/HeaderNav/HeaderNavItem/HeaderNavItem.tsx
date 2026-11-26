import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react";
import { Link } from "react-router";
import {
  HEADER_PILL_ACTIVE_CLASS_NAME,
  HEADER_PILL_CLASS_NAME,
  HEADER_PILL_IDLE_CLASS_NAME,
} from "@/constants/header";
import { LINK_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";
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
      className={`${HEADER_PILL_CLASS_NAME} ${
        isActive ? HEADER_PILL_ACTIVE_CLASS_NAME : HEADER_PILL_IDLE_CLASS_NAME
      }`}
      LeftIcon={
        <span
          className={`${LINK_ICON_MASK_CLASS_NAME} mask-contain ${entry.iconClassName}`}
          style={getIconMaskStyle(entry.icon)}
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
