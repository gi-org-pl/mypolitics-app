export interface SurveyEmailCaptureProps {
  address: string; // the text of the field, as typed
  hasConsent: boolean;
  privacyPolicyHref: string; // the app's privacy page
  onAddressChange: (address: string) => void;
  onConsentChange: (hasConsent: boolean) => void;
  onSubmit: (address: string) => void; // a valid address was confirmed, by the button or by Enter - the address trimmed
  onSkip: () => void; // "Pomiń"
}
