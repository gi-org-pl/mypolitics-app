import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import { FORCED_COLORS_BORDER_CLASS_NAME } from "@/constants/forced-colors";
import {
  HEADER_PILL_CLASS_NAME,
  HEADER_PILL_IDLE_CLASS_NAME,
} from "@/constants/header";

import { HeaderAccountAvatar } from "../HeaderAccountAvatar/HeaderAccountAvatar";
import { useSignOutAction } from "../utils/useSignOutAction";
import type { HeaderAccountPhoneProps } from "./HeaderAccountPhone.types";

// The account at the end of the phone menu: who is signed in, as a row drawn
// like the pills above it, and signing out as a white pill with a hairline
// outline. Signing out closes the menu. The name is the only place the phone
// shows who is signed in, so a long one wraps and the row grows.
export const HeaderAccountPhone = ({
  account,
  onNavigate,
}: HeaderAccountPhoneProps) => {
  const { t } = useLingui();
  const action = useSignOutAction(onNavigate);

  return (
    <>
      <div
        className={`flex min-h-10 items-center justify-center gap-2 rounded-3xl py-1 pl-1 ${HEADER_PILL_CLASS_NAME} ${HEADER_PILL_IDLE_CLASS_NAME} hover:bg-gi-light-primary/10`}
      >
        <HeaderAccountAvatar
          displayName={account.displayName}
          avatarUrl={account.avatarUrl}
          size="small"
          className="bg-white"
        />
        <span className="min-w-0 text-center leading-[1.2] wrap-break-word">
          {account.displayName}
        </span>
      </div>
      <Button
        type="outlined"
        variant="primary"
        size="regular"
        className={`${HEADER_PILL_CLASS_NAME} border-gi-light-primary/10 bg-white text-gi-light-primary hover:bg-gi-light-primary/10 ${FORCED_COLORS_BORDER_CLASS_NAME}`}
        onClick={() => void action.signOut()}
      >
        {t`Wyloguj się`}
      </Button>
      {action.hasFailed && (
        <p
          role="alert"
          className="text-center text-sm leading-[1.2] text-gi-red"
        >
          {t`Nie udało się wylogować. Spróbuj jeszcze raz.`}
        </p>
      )}
    </>
  );
};
