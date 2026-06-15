export type AgreementLevel = "high" | "mid" | "low";

export interface ResultsHeaderProps {
  id?: string;
  name: string;
  slogan: string;
  imageUrl: string;
  agreementPercent: number;
  actionLabel?: string;
  actionShortLabel?: string;
  onActionClick?: () => void;
}
