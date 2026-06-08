export type IdentityMode = "modal" | "expanded";

export interface IdentityInfoElement {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  agreementPercent: number;
  slogan: string;
}

export interface ResultIdentityPersonalityProps {
  identity: IdentityInfoElement;
  mode: IdentityMode;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  onToggleModal?: () => void;
  title?: string;
}
