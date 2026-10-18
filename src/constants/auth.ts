import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

import facebookMark from "@/assets/icons/facebook-mark.svg";
import googleMark from "@/assets/icons/google-mark.svg";
import xMark from "@/assets/icons/x-mark.svg";
import type { AuthIntentKey, IdentityProvider } from "@/types/auth";

export interface AuthProviderEntry {
  id: IdentityProvider;
  name: string; // the provider's own name, never translated
  // The name as it stands after a preposition of a sentence ("through",
  // "waiting for", "the window of"): Polish declines some of the names, and
  // each language says how its sentences need it.
  inflectedName: MessageDescriptor;
  continueLabel: MessageDescriptor; // the sign-in button
  mark: string; // the provider's own mark, in its own colours
}

// The providers in the order of the sign-in buttons. A new provider is one
// more entry here and in IdentityProvider.
export const AUTH_PROVIDERS: AuthProviderEntry[] = [
  {
    id: "google",
    name: "Google",
    inflectedName: msg({
      message: "Google",
      comment: "The provider's name after a preposition",
    }),
    continueLabel: msg`Kontynuuj z Google`,
    mark: googleMark,
  },
  {
    id: "facebook",
    name: "Facebook",
    inflectedName: msg({
      message: "Facebooka",
      comment: "The provider's name after a preposition",
    }),
    continueLabel: msg`Kontynuuj z Facebookiem`,
    mark: facebookMark,
  },
  {
    id: "x",
    name: "X",
    inflectedName: msg({
      message: "X",
      comment: "The provider's name after a preposition",
    }),
    continueLabel: msg`Kontynuuj z X`,
    mark: xMark,
  },
];

export const getAuthProvider = (id: IdentityProvider): AuthProviderEntry =>
  AUTH_PROVIDERS.find((provider) => provider.id === id) ?? AUTH_PROVIDERS[0];

// How long a display name may be, in characters as a person counts them.
export const DISPLAY_NAME_MAX_LENGTH = 50;
export const DISPLAY_NAME_MIN_LENGTH = 2;

// Why an account is needed, in the terms of the action: what will be kept on
// the account, then that the first sign-in creates it. The dialog shows it
// under its heading.
export const AUTH_INTENTS: Record<AuthIntentKey, { line: MessageDescriptor }> =
  {
    "create-quiz": {
      line: msg`Quiz zapiszemy na Twoim koncie. Pierwsze logowanie je zakłada.`,
    },
  };
