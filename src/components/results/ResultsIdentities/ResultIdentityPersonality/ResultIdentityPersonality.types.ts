export type IdentityMode = "modal" | "expanded";

export interface IdentityInfoElement {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  agreementPercent: number; // 0–100
  slogan: string;
}

export interface ResultIdentityPersonalityProps {
  identity: IdentityInfoElement;
  mode: IdentityMode;
  expanded?: boolean; // only relevant when mode === "expanded"
  onToggleExpanded?: () => void;
  onToggleModal?: () => void;
  title?: string; // generic label shown before the percent (default e.g. "Tożsamość")
}
