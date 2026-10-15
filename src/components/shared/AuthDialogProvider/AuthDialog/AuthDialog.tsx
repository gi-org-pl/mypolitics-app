import { useLingui } from "@lingui/react/macro";
import { createPortal } from "react-dom";
import { useLocation } from "react-router";

import { SignInFlow } from "@/components/account/SignInFlow/SignInFlow";
import { AUTH_INTENTS } from "@/constants/auth";
import { PATHS } from "@/constants/paths";
import { doNothing } from "@/utils/function/doNothing";

import type { AuthDialogProps } from "./AuthDialog.types";
import { useAuthDialog } from "./utils/useAuthDialog";

// The sign-in over the page, for an action that needs an account: a modal in
// the middle from the tablet width up, a bottom sheet on a phone. The page
// behind is dimmed and does not scroll.
//
// It is rendered into the body, like the survey dialogs, so no transformed
// ancestor can cut it off, and it is not Athena's Modal: that one cannot be a
// bottom sheet, collects its focusable controls once (the card turns into
// the step while the dialog is open), and names its close button in English.
//
// Closing - the close button, Escape, a press on the dimmed page, or the
// cancel button of the step - is refused while the account is being saved.
export const AuthDialog = ({ intent, onClose }: AuthDialogProps) => {
  const { t, i18n } = useLingui();
  const { pathname, search, hash } = useLocation();
  const dialog = useAuthDialog(onClose);

  // It only ever opens on a press in the browser, so the body is there.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-gi-dark-primary/40 md:items-center md:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dialog.close();
      }}
    >
      <div
        ref={dialog.dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialog.headingId}
        aria-describedby={dialog.descriptionId}
        tabIndex={-1}
        className="max-h-dvh w-full overflow-y-auto outline-none md:max-w-120"
        onKeyDown={dialog.onKeyDown}
      >
        <SignInFlow
          heading={t`Najpierw zaloguj się`}
          description={i18n._(AUTH_INTENTS[intent].line)}
          returnTo={PATHS.signIn(`${pathname}${search}${hash}`)}
          cardLayout="sheet-on-phone"
          headingId={dialog.headingId}
          descriptionId={dialog.descriptionId}
          onClose={dialog.close}
          onBusyChange={dialog.setIsBusy}
          onSignedIn={doNothing}
          onCancel={onClose}
        />
      </div>
    </div>,
    document.body,
  );
};
