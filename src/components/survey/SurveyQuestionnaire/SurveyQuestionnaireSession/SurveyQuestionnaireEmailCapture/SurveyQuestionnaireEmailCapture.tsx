import { SurveyEmailCapture } from "@/components/survey/SurveyEmailCapture/SurveyEmailCapture";
import { PATHS } from "@/constants/paths";
import type { SurveyPhaseContentProps } from "@/types/survey";

// The fifth phase: the e-mail card. It only collects: the address and the
// consent go to the session, which holds them in memory, and results
// calculation makes the request once the result exists. Nothing is sent here.
//
// Whether the phase is part of a session is the session's to say; here it is
// on screen, so it is.
export const SurveyQuestionnaireEmailCapture = ({
  session: { session, setEmail, leaveEmailCapture },
}: SurveyPhaseContentProps) => {
  const address = session.email?.address ?? "";
  const hasConsent = session.email?.hasConsent ?? false;

  return (
    <SurveyEmailCapture
      address={address}
      hasConsent={hasConsent}
      privacyPolicyHref={PATHS.privacy}
      onAddressChange={(typedAddress) =>
        setEmail({ address: typedAddress, hasConsent })
      }
      onConsentChange={(isTicked) =>
        setEmail({ address, hasConsent: isTicked })
      }
      onSubmit={(trimmedAddress) => {
        setEmail({ address: trimmedAddress, hasConsent });
        leaveEmailCapture(true);
      }}
      onSkip={() => leaveEmailCapture(false)}
    />
  );
};
