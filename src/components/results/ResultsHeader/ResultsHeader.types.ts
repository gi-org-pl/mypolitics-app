import type { Orientation } from "@/types/orientation";
import type { ResultModuleLowMatch } from "@/types/results";
import type { MatchBand } from "@/utils/results/getMatchBand";

export type ResultsTab = "results" | "comparison";

export interface ResultsHeaderProps {
  orientation?: Orientation;
  confidence?: number;
  linkLabel?: string;
  // What the header does with an orientation below a partial match: it says
  // that nothing matches, or names the orientation with its confidence.
  lowMatch?: ResultModuleLowMatch;
  // What it says under an orientation it names below a partial match.
  lowMatchLabel?: string;
  activeTab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
}

// The band of a result the header names. It is "none" only for an orientation
// named below a partial match.
export type ResultsHeaderBand = MatchBand;

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
