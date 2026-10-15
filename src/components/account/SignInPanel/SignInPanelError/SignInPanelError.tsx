import { useLingui } from "@lingui/react/macro";

import { getAuthProvider } from "@/constants/auth";

import type { SignInPanelErrorProps } from "./SignInPanelError.types";

// Why the last sign-in did not work, in a red outlined box above the
// buttons. It is an alert: it is announced when it appears, and the buttons
// under it stay available for the next attempt.
export const SignInPanelError = ({ error }: SignInPanelErrorProps) => {
  const { t, i18n } = useLingui();
  let title: string;
  let text: string;

  if (error.kind === "failed") {
    title = t`Coś poszło nie tak`;
    text = t`Nie udało się zalogować. Spróbuj jeszcze raz.`;
  } else {
    const provider = getAuthProvider(error.provider);
    const name = provider.name;
    const inflectedName = i18n._(provider.inflectedName);

    if (error.kind === "window-closed") {
      title = t`Logowanie przerwane`;
      text = t`Okno ${inflectedName} zostało zamknięte przed końcem logowania. Spróbuj jeszcze raz.`;
    } else {
      title = t`${name} nie odpowiada`;
      text = t`Nie udało się zalogować przez ${inflectedName}. Spróbuj za chwilę albo wybierz inny sposób.`;
    }
  }

  return (
    <div
      role="alert"
      className="flex flex-col gap-0.5 rounded-2xl border border-gi-red bg-white px-4 py-3 text-sm leading-5 wrap-break-word text-gi-red"
    >
      <p className="font-bold">{title}</p>
      <p>{text}</p>
    </div>
  );
};
