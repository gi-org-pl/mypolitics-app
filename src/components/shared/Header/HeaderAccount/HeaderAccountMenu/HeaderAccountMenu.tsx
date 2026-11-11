import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import { getAuthProvider } from "@/constants/auth";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import {
  HEADER_PILL_CLASS_NAME,
  HEADER_PILL_IDLE_CLASS_NAME,
} from "@/constants/header";

import { HeaderAccountAvatar } from "../HeaderAccountAvatar/HeaderAccountAvatar";
import { useSignOutAction } from "../utils/useSignOutAction";
import type { HeaderAccountMenuProps } from "./HeaderAccountMenu.types";
import { useAccountMenu } from "./utils/useAccountMenu";

// The account in the wide header: a pill with the avatar and the name, which
// opens the account menu under it - who is signed in, with which provider
// and address, and signing out. The pages of the person's quizzes and of
// their account settings join the menu when they exist.
//
// The pill is a disclosure button: the menu holds the identity as well as
// the action, so it is a group shown and hidden, not an ARIA menu. Escape
// anywhere inside closes it.
export const HeaderAccountMenu = ({ account }: HeaderAccountMenuProps) => {
  const { t } = useLingui();
  const menu = useAccountMenu();
  const action = useSignOutAction(menu.close);
  const provider = getAuthProvider(account.provider);

  return (
    <div className="relative" onKeyDown={menu.onKeyDown}>
      <Button
        ref={menu.buttonRef}
        type="ghost"
        variant="primary"
        size="regular"
        aria-expanded={menu.isOpen}
        aria-controls={menu.menuId}
        className={`${HEADER_PILL_CLASS_NAME} ${HEADER_PILL_IDLE_CLASS_NAME} gap-2 pl-1`}
        onClick={menu.toggle}
      >
        <HeaderAccountAvatar
          displayName={account.displayName}
          avatarUrl={account.avatarUrl}
          size="small"
          className="bg-white"
        />
        <span className="max-w-40 truncate">{account.displayName}</span>
      </Button>

      {menu.isOpen && (
        <div
          ref={menu.menuRef}
          id={menu.menuId}
          role="group"
          aria-label={t`Konto`}
          className="absolute top-full right-0 z-50 mt-3 flex w-70 flex-col gap-1 rounded-2xl border border-gi-dark-ash bg-white p-2 text-gi-primary"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            <HeaderAccountAvatar
              displayName={account.displayName}
              avatarUrl={account.avatarUrl}
              size="medium"
              className="bg-gi-light-primary/10"
            />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-base leading-[1.2] font-bold wrap-break-word">
                {account.displayName}
              </p>
              <p className="flex min-w-0 items-center gap-1.5 text-sm leading-4 text-gi-primary/50">
                <img
                  src={provider.mark}
                  alt={provider.name}
                  className="size-3.5 shrink-0"
                />
                {account.email && (
                  <span className="truncate">{account.email}</span>
                )}
              </p>
            </div>
          </div>
          <hr className="border-gi-ash" />
          <button
            type="button"
            className={`rounded-xl px-3 py-2.5 text-left text-base leading-[1.2] font-bold hover:bg-gi-ash ${FOCUS_CLASS_NAME}`}
            onClick={() => void action.signOut()}
          >
            {t`Wyloguj się`}
          </button>
          {action.hasFailed && (
            <p
              role="alert"
              className="px-3 pb-1 text-sm leading-[1.2] text-gi-red"
            >
              {t`Nie udało się wylogować. Spróbuj jeszcze raz.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
