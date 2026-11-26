import type { AuthCardLayout } from "@/components/account/AuthCard/AuthCard.types";
import type { IdentityProvider } from "@/types/auth";

export type SignInError =
  | { kind: "window-closed"; provider: IdentityProvider }
  | { kind: "provider-failed"; provider: IdentityProvider }
  | { kind: "failed" };

export type SignInPanelView =
  | { kind: "choose"; waitingFor?: IdentityProvider; error?: SignInError }
  | {
      kind: "account-exists";
      provider: IdentityProvider; // the provider the person just used
      ownerProvider: IdentityProvider; // the provider the account was made with
      email: string;
      isWaiting?: boolean;
    };

export interface SignInPanelProps {
  heading: string; // the page's or the action's heading, for the choose view
  description: string; // the page's or the action's line, for the choose view
  view: SignInPanelView;
  termsHref: string;
  privacyHref: string;
  headingLevel?: 1 | 2;
  cardLayout?: AuthCardLayout;
  headingId?: string;
  descriptionId?: string;
  onClose?: () => void;
  onProviderSelect: (provider: IdentityProvider) => void;
  onChooseAnother: () => void;
}
