import type { Orientation } from "@/types/orientation";
import type { MatchBand } from "@/utils/results/getMatchBand";

export type ResultsTab = "results" | "comparison";

export interface ResultsHeaderLink {
  url: string;
  label?: string;
}

export interface ResultsHeaderProps {
  orientation?: Orientation;
  confidence?: number;
  slogan?: string;
  link?: ResultsHeaderLink;
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
