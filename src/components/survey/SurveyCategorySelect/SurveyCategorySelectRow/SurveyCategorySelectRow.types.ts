export interface SurveyCategorySelectRowProps {
  name: string;
  index: number;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}
