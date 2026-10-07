import { Button } from "@gi-org-pl/athena";
import type { ReactNode } from "react";

interface ArchetypeControlProps {
  label: string;
  isOpen: boolean;
  hasDivider?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const CONTROL_CLASS_NAME =
  "relative h-[33px] min-w-0 flex-1 gap-2 rounded-none first:rounded-bl-2xl last:rounded-br-2xl before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']";
const QUIET_CLASS_NAME = "bg-transparent hover:bg-gi-ash";
const DIVIDER_CLASS_NAME = "border-l border-gi-ash";

export const ArchetypeControl = ({
  label,
  isOpen,
  hasDivider = false,
  onClick,
  children,
}: ArchetypeControlProps) => (
  <Button
    type="ghost"
    variant="primary"
    size="small"
    isIconButton
    aria-label={label}
    aria-expanded={isOpen}
    className={`${CONTROL_CLASS_NAME} ${isOpen ? "" : QUIET_CLASS_NAME} ${hasDivider ? DIVIDER_CLASS_NAME : ""}`}
    onClick={onClick}
  >
    {children}
  </Button>
);
