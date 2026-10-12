export interface SurveyPhaseActionsProps {
  primaryLabel: string; // passed translated
  onPrimary: () => void;
  isPrimaryDisabled?: boolean; // default false
  primaryDisabledReason?: string; // read by assistive technology while the primary button is off
  onSkip: () => void; // "Pomiń"
}
