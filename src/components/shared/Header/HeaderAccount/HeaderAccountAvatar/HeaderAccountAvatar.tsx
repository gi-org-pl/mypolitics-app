import { Avatar } from "@gi-org-pl/athena";

import { getInitials } from "@/utils/auth/getInitials";

import type { HeaderAccountAvatarProps } from "./HeaderAccountAvatar.types";

// The person's avatar: the provider's photo, or their initials when there is
// none or it fails to load (Athena falls back by itself). Athena takes the
// first letters of the first and the last word; the app's rule is the first
// two words, so it is handed those two letters as two words. The avatar is
// decoration: the name always stands next to it.
export const HeaderAccountAvatar = ({
  displayName,
  avatarUrl,
  size,
  className = "",
}: HeaderAccountAvatarProps) => (
  <Avatar
    src={avatarUrl}
    name={Array.from(getInitials(displayName)).join(" ")}
    fallback="initials"
    size={size}
    role={undefined}
    aria-label={undefined}
    aria-hidden="true"
    className={className}
  />
);
