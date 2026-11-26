import type { AuthCardLayout } from "@/components/account/AuthCard/AuthCard.types";
import type { SignInError } from "@/components/account/SignInPanel/SignInPanel.types";
import type {
  AccountSetup,
  AuthAccount,
  IdentityProvider,
  PendingSignUp,
} from "@/types/auth";

export interface SignInFlowProps {
  heading: string; // for the choose view: the page's or the dialog's
  description: string;
  returnTo?: string; // where a full-page provider sign-in comes back to
  resume?: boolean; // on mount, ask the client how a sign-in that left the page ended
  headingLevel?: 1 | 2;
  cardLayout?: AuthCardLayout;
  headingId?: string;
  descriptionId?: string;
  onClose?: () => void; // the dialog's close button, on every view
  onBusyChange?: (isBusy: boolean) => void; // true while the account is saved
  onSignedIn: (account: AuthAccount) => void;
  onCancel?: () => void; // the cancel button of the step, after the pending sign-up is dropped
}

// One state per row of the spec's "States and lifecycle - The card", and the
// moment a sign-in that left the page is resumed.
export type SignInFlowState =
  | { step: "resuming" }
  | { step: "choose"; waitingFor?: IdentityProvider; error?: SignInError }
  | {
      step: "account-exists";
      pendingId: string;
      provider: IdentityProvider;
      ownerProvider: IdentityProvider;
      email: string;
      isWaiting: boolean;
    }
  | {
      step: "setup";
      signUp: PendingSignUp;
      isSaving: boolean;
      hasSaveFailed: boolean;
    };

export interface SignInFlowActions {
  chooseProvider: (provider: IdentityProvider) => void;
  signInOwner: () => void;
  chooseAnother: () => void;
  completeSetup: (setup: AccountSetup) => void;
  cancelSetup: () => void;
}
