export interface SurveyEmailCaptureConsentProps {
  hasConsent: boolean;
  privacyPolicyHref: string; // the app's privacy page
  promiseId: string; // the identifier the promise is found by: it describes the e-mail field
  onConsentChange: (hasConsent: boolean) => void;
}
