import { useLingui } from "@lingui/react/macro";

import type { IdentityProvider } from "@/types/auth";

import type { AccountSetupIssue } from "../AccountSetupForm.types";

// The messages of what is missing, and the privacy promise naming the
// provider the person signed in with. Each provider has a sentence of its
// own: Polish says "konta Google" but "konta na Facebooku".
export const useSetupTexts = (provider: IdentityProvider) => {
  const { t } = useLingui();

  const messages: Record<AccountSetupIssue, string> = {
    "name-missing": t`Wpisz nazwę, którą podpiszemy Twoje quizy.`,
    "name-too-short": t`Nazwa musi mieć co najmniej 2 znaki.`,
    "age-not-declared": t`Konto mogą założyć osoby, które mają ukończone 16 lat.`,
    "terms-not-accepted": t`Żeby założyć konto, zaakceptuj Regulamin i Politykę prywatności.`,
  };

  const promises: Record<IdentityProvider, string> = {
    google: t`Dbamy o Twoją prywatność. Dane z konta Google (w tym adres e-mail) nigdy nie będą powiązane z danymi o Twoich poglądach.`,
    facebook: t`Dbamy o Twoją prywatność. Dane z konta na Facebooku (w tym adres e-mail) nigdy nie będą powiązane z danymi o Twoich poglądach.`,
    x: t`Dbamy o Twoją prywatność. Dane z konta X (w tym adres e-mail) nigdy nie będą powiązane z danymi o Twoich poglądach.`,
  };

  return { messages, promise: promises[provider] };
};
