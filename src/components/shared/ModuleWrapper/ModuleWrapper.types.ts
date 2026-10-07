import type { ReactNode } from "react";

export interface ModuleWrapperProps {
  title?: ReactNode;
  ariaLabel?: string;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
  children?: ReactNode;
}
