import { Button } from "@gi-org-pl/athena";
import type { Ref } from "react";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";

interface HorizontalBarChartControlProps {
  label: string;
  isExpanded: boolean;
  isQuiet?: boolean;
  hasDivider?: boolean;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}

const CONTROL_CLASS_NAME =
  "relative h-[33px] w-full rounded-t-none rounded-b-2xl before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']";
const DIVIDER_CLASS_NAME = "border-b border-gi-ash";
const QUIET_CLASS_NAME = "bg-transparent hover:bg-gi-ash";

export const HorizontalBarChartControl = ({
  label,
  isExpanded,
  isQuiet = false,
  hasDivider = false,
  onClick,
  ref,
}: HorizontalBarChartControlProps) => (
  <Button
    ref={ref}
    type="ghost"
    variant="primary"
    size="small"
    isIconButton
    aria-label={label}
    aria-expanded={isExpanded}
    className={`${CONTROL_CLASS_NAME} ${hasDivider ? DIVIDER_CLASS_NAME : ""} ${isQuiet ? QUIET_CLASS_NAME : ""}`}
    onClick={onClick}
  >
    <img
      src={chevronDownIcon}
      alt=""
      className={isExpanded ? "rotate-180" : undefined}
    />
  </Button>
);
