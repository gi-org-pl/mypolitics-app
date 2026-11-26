export interface QuestionFilterProps {
  isOn: boolean; // whether only the questions the two sides disagree on are listed
  onChange: (isOn: boolean) => void;
}
