import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import { AUTH_PROVIDERS, getAuthProvider } from "@/constants/auth";
import { QUIET_BUTTON_CLASS_NAME } from "@/constants/button";

import { AuthCard } from "../AuthCard/AuthCard";
import { LINK_CLASS_NAME } from "./SignInPanel.constants";
import type { SignInPanelProps } from "./SignInPanel.types";
import { SignInPanelError } from "./SignInPanelError/SignInPanelError";
import { SignInProviderButton } from "./SignInProviderButton/SignInProviderButton";

// The sign-in card: one button per provider, the terms and the privacy
// policy, and every state the sign-in can be in - waiting for a provider, an
// error, or an address that already belongs to an account made with another
// provider. It only draws: what it shows comes in through `view`, and a press
// goes out through a callback.
export const SignInPanel = ({
  heading,
  description,
  view,
  termsHref,
  privacyHref,
  headingLevel,
  headingId,
  descriptionId,
  onClose,
  onProviderSelect,
  onChooseAnother,
}: SignInPanelProps) => {
  const { t, i18n } = useLingui();
  const cardProps = { headingLevel, headingId, descriptionId, onClose };

  if (view.kind === "account-exists") {
    const owner = getAuthProvider(view.ownerProvider);
    const ownerName = i18n._(owner.inflectedName);
    const addedName = i18n._(getAuthProvider(view.provider).inflectedName);
    const { email } = view;

    return (
      <AuthCard
        {...cardProps}
        heading={t`To konto już istnieje`}
        description={t`Adres ${email} należy do konta założonego przez ${ownerName}. Zaloguj się przez ${ownerName}, a ${addedName} dodamy jako drugi sposób logowania.`}
      >
        <SignInProviderButton
          mark={owner.mark}
          label={
            view.isWaiting
              ? t`Czekamy na ${ownerName}…`
              : t`Zaloguj się przez ${ownerName}`
          }
          isWaiting={view.isWaiting}
          onSelect={() => onProviderSelect(owner.id)}
        />
        <Button
          type="ghost"
          variant="primary"
          className={`${QUIET_BUTTON_CLASS_NAME} self-center`}
          disabled={view.isWaiting}
          onClick={onChooseAnother}
        >
          {t`Wybierz inny sposób`}
        </Button>
      </AuthCard>
    );
  }

  const { waitingFor, error } = view;

  return (
    <AuthCard {...cardProps} heading={heading} description={description}>
      {error && <SignInPanelError error={error} />}
      <div className="flex flex-col gap-3">
        {AUTH_PROVIDERS.map((provider) => {
          const isWaiting = waitingFor === provider.id;
          const inflectedName = i18n._(provider.inflectedName);

          return (
            <SignInProviderButton
              key={provider.id}
              mark={provider.mark}
              label={
                isWaiting
                  ? t`Czekamy na ${inflectedName}…`
                  : i18n._(provider.continueLabel)
              }
              isWaiting={isWaiting}
              isDisabled={waitingFor !== undefined && !isWaiting}
              onSelect={() => onProviderSelect(provider.id)}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm leading-4">
        <a
          href={termsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS_NAME}
        >
          {t`Regulamin`}
        </a>
        <span aria-hidden className="h-3 w-px bg-gi-primary/25" />
        <a
          href={privacyHref}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS_NAME}
        >
          {t`Polityka prywatności`}
        </a>
      </div>
    </AuthCard>
  );
};
