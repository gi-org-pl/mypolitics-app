export interface HeaderAccountAvatarProps {
  displayName: string;
  avatarUrl?: string;
  size: "small" | "medium"; // 32 px in the pills, 40 px in the menu
  className?: string; // the background it stands on
}
