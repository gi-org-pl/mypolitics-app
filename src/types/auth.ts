// A company a person signs in with. The order of the sign-in buttons is the
// order of AUTH_PROVIDERS, not of this union.
export type IdentityProvider = "google" | "facebook" | "x";

// The account of the person signed in.
export interface AuthAccount {
  id: string;
  displayName: string;
  avatarUrl?: string; // the provider's photo; without one the initials are drawn
  email?: string; // only an address the provider verified; X often gives none
  provider: IdentityProvider; // the provider of the current sign-in
}

export type AuthSession =
  | { status: "unknown" } // the client has not answered yet
  | { status: "signed-out" }
  | { status: "signed-in"; account: AuthAccount };

// A provider sign-in that found no account. Nothing is saved until the
// person completes the account, see AccountSetup. The identifier ties the
// completion or the cancellation to this very sign-up, so a second sign-in
// in another tab of the same browser cannot take its place.
export interface PendingSignUp {
  id: string;
  provider: IdentityProvider;
  suggestedName?: string;
  avatarUrl?: string;
  email?: string;
}

// What one provider sign-in ends in.
export type SignInOutcome =
  | { kind: "signed-in"; account: AuthAccount }
  | { kind: "new-account"; signUp: PendingSignUp }
  | {
      // The provider's address belongs to an account made with another
      // provider. The accounts are never merged on the address: the person
      // signs in with the owning provider, and this one is linked then.
      kind: "account-exists";
      pendingId: string; // the pending link, for the owner's sign-in and for cancelling
      provider: IdentityProvider;
      ownerProvider: IdentityProvider;
      email: string;
    }
  // A sign-in meant to link a provider (SignInOptions.link) found nothing
  // to link to: the pending link expired, or the identity that signed in
  // belongs to another account than the one the address belongs to. No
  // session was started and nothing was linked.
  | { kind: "link-failed" }
  | { kind: "window-closed"; provider: IdentityProvider }
  | { kind: "provider-failed"; provider: IdentityProvider }
  | { kind: "failed" };

// What completes a pending sign-up. The two declarations are part of the
// type so that an account can never be completed without them.
export interface AccountSetup {
  displayName: string; // already cleaned and valid
  isAgeDeclared: true;
  hasAcceptedTerms: true;
}

export type CompleteSignUpOutcome =
  | { kind: "signed-in"; account: AuthAccount }
  | { kind: "expired" } // the pending sign-up is gone
  | { kind: "failed" };

export interface SignInOptions {
  // Where a sign-in that has to leave the page for the provider comes back:
  // the sign-in page, which resumes it.
  returnTo?: string;
  // The sign-in with the provider that owns the address, after
  // "account-exists", names the pending link it completes: it links the
  // waiting provider, or fails as a whole.
  link?: string;
  // Aborting closes the provider window, settles the sign-in as a closed
  // window, and undoes whatever the sign-in started, so that closing the
  // dialog never leaves anyone signed in or anything pending.
  signal?: AbortSignal;
}

// Everything the app asks of whatever keeps the accounts. The screens talk
// only to this, so the stand-in of today and the API adapter of later are
// interchangeable.
export interface AuthClient {
  // The account of this browser's session, or null without one. Rejects
  // when the answer cannot be had; the app then treats the person as
  // signed out.
  getSession: () => Promise<AuthAccount | null>;
  signIn: (
    provider: IdentityProvider,
    options?: SignInOptions,
  ) => Promise<SignInOutcome>;
  // How a sign-in that had to leave the page ended, once the provider has
  // sent the person back; null when there is none.
  resumeSignIn: () => Promise<SignInOutcome | null>;
  // Completing the same pending sign-up again answers with the account it
  // made, so a completion whose answer was lost can be repeated safely.
  completeSignUp: (
    pendingId: string,
    setup: AccountSetup,
  ) => Promise<CompleteSignUpOutcome>;
  // Drops a pending sign-up or a pending link.
  cancelPending: (pendingId: string) => Promise<void>;
  // Rejects when the session could not be ended.
  signOut: () => Promise<void>;
}

export interface AuthSessionValue {
  session: AuthSession;
  client: AuthClient;
  // Called by the sign-in screens when a sign-in has finished.
  setSignedIn: (account: AuthAccount) => void;
  // True when the session ended. False when the client could not end it:
  // the person is then still signed in.
  signOut: () => Promise<boolean>;
  // Asks the client for the session again.
  refresh: () => Promise<void>;
}
