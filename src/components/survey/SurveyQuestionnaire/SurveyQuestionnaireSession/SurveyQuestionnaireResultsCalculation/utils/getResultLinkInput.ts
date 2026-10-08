import type { ResultLinkInput, SurveySession } from "@/types/survey";

// What the request for the result link is made with: the address and the
// consent the session holds, the session identifier as the result the link
// opens, and the language of the app - English when it runs in English,
// Polish otherwise. A session that holds no e-mail asks for no link.
export const getResultLinkInput = (
  session: SurveySession,
  locale: string,
): ResultLinkInput | undefined =>
  session.email === null
    ? undefined
    : {
        email: session.email.address,
        resultId: session.id,
        marketingConsent: session.email.hasConsent,
        language: locale === "en" ? "en" : "pl",
      };
