export interface HandIn {
  hasFailed: boolean;
  retry: () => void;
}
