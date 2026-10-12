export interface SurveyEmailCaptureFieldProps {
  address: string; // the text of the field, as typed
  descriptionId: string; // the element that describes the field: the promise of the card
  onAddressChange: (address: string) => void;
  onSubmit: (address: string) => void; // Enter with a valid address - the address trimmed
}
