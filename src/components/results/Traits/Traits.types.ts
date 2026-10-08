import type { Orientation } from "@/types/orientation";

export interface TraitsComparison {
  orientation: Orientation;
  earnedIds: string[];
}

export interface TraitsProps {
  title?: string;
  traits: Orientation[];
  earnedIds: string[];
  comparison?: TraitsComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}

export type TraitHolder = "taker" | "both" | "other";

export interface TraitItem {
  orientation: Orientation;
  holder: TraitHolder;
}
