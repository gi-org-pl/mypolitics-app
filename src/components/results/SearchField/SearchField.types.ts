export interface SearchFieldProps {
  label: string; // what is searched for: the name of the field, and what stands in it while it is empty
  value: string;
  onChange: (value: string) => void;
}
