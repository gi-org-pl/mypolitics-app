import { useLingui } from "@lingui/react/macro";
import { Navigate, useLocation, useSearchParams } from "react-router";

import { SignInFlow } from "@/components/account/SignInFlow/SignInFlow";
import { useAuthSession } from "@/utils/auth/useAuthSession";
import { doNothing } from "@/utils/function/doNothing";
import { toSafeNextPath } from "@/utils/url/toSafeNextPath";

// The sign-in page at /login, where "Zaloguj się" in the header leads and a
// provider that needed the whole page comes back to. Once the person is in -
// on arrival, after a provider, or after the last step - the page sends them
// to `next`, a path inside the app, or home; the visit to this page is
// replaced, so going back does not land on it again.
//
// It shows nothing until the session is known, and resumes a sign-in that
// left the page: until the flow knows how it ended, the flow shows nothing.
export default function SignInPage() {
  const { t } = useLingui();
  const { session } = useAuthSession();
  const { pathname, search } = useLocation();
  const [searchParams] = useSearchParams();
  const next = toSafeNextPath(searchParams.get("next"));

  if (session.status === "signed-in") return <Navigate to={next} replace />;
  if (session.status === "unknown") return null;

  return (
    <div className="mx-auto box-content max-w-120 px-4 pt-4 pb-8 md:pt-8 md:pb-24">
      <SignInFlow
        heading={t`Zaloguj się lub załóż konto`}
        description={t`Pierwsze logowanie zakłada konto, w którym tworzysz quizy. Quizy rozwiążesz bez logowania.`}
        headingLevel={1}
        returnTo={`${pathname}${search}`}
        resume
        onSignedIn={doNothing}
      />
    </div>
  );
}
