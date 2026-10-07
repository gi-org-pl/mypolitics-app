import type { Orientation } from "@/types/orientation";
import type { MatchBand } from "@/utils/results/getMatchBand";

export type ResultsTab = "results" | "comparison";

export interface ResultsHeaderProps {
  orientation?: Orientation;
  confidence?: number;
  linkLabel?: string;
  activeTab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
}

export type ResultsHeaderBand = Exclude<MatchBand, "none">;

export interface ResultsHeaderResult {
  name: string;
  imageUrl?: string;
  confidence: number;
  band: ResultsHeaderBand;
}

export interface ResultsHeaderSafeLink {
  href: string;
  label: string;
}
