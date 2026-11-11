export interface HeaderAccountProps {
  variant: "bar" | "menu"; // the wide header, or the phone menu - as HeaderNav
  onNavigate?: () => void; // closes the phone menu
}
