export default interface SurveyNewsletterProps {
  email: string;
  onEmailChange: (email: string) => void;
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
}
