export interface AccountSetupFormConsentsProps {
  ids: {
    age: string;
    ageMessage: string;
    terms: string;
    termsSentence: string;
    termsMessage: string;
  };
  isAgeDeclared: boolean;
  hasAcceptedTerms: boolean;
  ageMessage?: string;
  termsMessage?: string;
  isDisabled: boolean;
  termsHref: string;
  privacyHref: string;
  onAgeChange: (isAgeDeclared: boolean) => void;
  onTermsChange: (hasAcceptedTerms: boolean) => void;
}
