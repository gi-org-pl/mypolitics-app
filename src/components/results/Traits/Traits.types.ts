import type { AxisOrientation } from "@/types/axis";

export interface TraitsComparison {
  party: AxisOrientation;
  earnedIds: string[];
}

export interface TraitsProps {
  title?: string;
  traits: AxisOrientation[];
  earnedIds: string[];
  comparison?: TraitsComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}

export type TraitHolder = "taker" | "both" | "other";

export interface TraitItem {
  id: string;
  name: string;
  imageUrl?: string;
  color?: string;
  holder: TraitHolder;
}
