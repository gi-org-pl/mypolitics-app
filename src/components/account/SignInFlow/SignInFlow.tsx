import { AccountSetupForm } from "@/components/account/AccountSetupForm/AccountSetupForm";
import { SignInPanel } from "@/components/account/SignInPanel/SignInPanel";
import { PATHS } from "@/constants/paths";

import type { SignInFlowProps } from "./SignInFlow.types";
import { toPanelView } from "./utils/toPanelView";
import { useSignInFlow } from "./utils/useSignInFlow";

// The sign-in from the first press to the account: the card, the step that
// completes a new account, and every outcome of the provider in between. The
// sign-in page and the auth dialog both show it, so a change to the flow is a
// change to both.
export const SignInFlow = ({
  heading,
  description,
  returnTo,
  resume,
  headingLevel,
  headingId,
  descriptionId,
  onClose,
  onBusyChange,
  onSignedIn,
  onCancel,
}: SignInFlowProps) => {
  const flow = useSignInFlow({
    returnTo,
    resume,
    onSignedIn,
    onCancel,
    onBusyChange,
  });
  const { state } = flow;
  const cardProps = { headingLevel, headingId, descriptionId, onClose };

  if (state.step === "setup") {
    return (
      <AccountSetupForm
        {...cardProps}
        provider={state.signUp.provider}
        suggestedName={state.signUp.suggestedName}
        isSaving={state.isSaving}
        hasSaveFailed={state.hasSaveFailed}
        isCloseDisabled={state.isSaving}
        termsHref={PATHS.terms}
        privacyHref={PATHS.privacy}
        onSubmit={flow.completeSetup}
        onCancel={flow.cancelSetup}
      />
    );
  }

  return (
    <SignInPanel
      {...cardProps}
      heading={heading}
      description={description}
      view={toPanelView(state)}
      termsHref={PATHS.terms}
      privacyHref={PATHS.privacy}
      onProviderSelect={(provider) =>
        state.step === "account-exists"
          ? flow.signInOwner()
          : flow.chooseProvider(provider)
      }
      onChooseAnother={flow.chooseAnother}
    />
  );
};
