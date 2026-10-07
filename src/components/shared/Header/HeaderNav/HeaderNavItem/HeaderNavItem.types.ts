import type { HeaderNavEntry } from "../HeaderNav.types";

export type HeaderNavItemProps = {
  entry: HeaderNavEntry;
  isActive: boolean;
  onNavigate: () => void;
};
