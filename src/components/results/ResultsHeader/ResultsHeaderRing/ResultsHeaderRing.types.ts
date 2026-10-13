import type { ResultsHeaderBand } from "../ResultsHeader.types";

export interface ResultsHeaderRingProps {
  confidence: number;
  band: ResultsHeaderBand;
  imageUrl?: string;
}
