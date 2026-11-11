import { useAuthSession } from "@/utils/auth/useAuthSession";

import type { HeaderAccountProps } from "./HeaderAccount.types";
import { HeaderAccountMenu } from "./HeaderAccountMenu/HeaderAccountMenu";
import { HeaderAccountPhone } from "./HeaderAccountPhone/HeaderAccountPhone";
import { HeaderAccountSignIn } from "./HeaderAccountSignIn/HeaderAccountSignIn";

// The account place of the header. Nothing while the session is not known,
// so a signed-in person never sees "sign in" flash; the sign-in pill when
// signed out; the account when signed in. In the wide header it stands after
// a thin divider, in the phone menu after the navigation.
export const HeaderAccount = ({ variant, onNavigate }: HeaderAccountProps) => {
  const { session } = useAuthSession();

  if (session.status === "unknown") return null;

  if (variant === "menu") {
    return session.status === "signed-in" ? (
      <HeaderAccountPhone account={session.account} onNavigate={onNavigate} />
    ) : (
      <HeaderAccountSignIn className="w-full" onNavigate={onNavigate} />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="h-3 w-px bg-gi-primary/25" />
      {session.status === "signed-in" ? (
        <HeaderAccountMenu account={session.account} />
      ) : (
        <HeaderAccountSignIn />
      )}
    </div>
  );
};
