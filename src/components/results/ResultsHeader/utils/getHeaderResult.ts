import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";
import { getMatchBand } from "@/utils/results/getMatchBand";

import { MAX_CONFIDENCE, MIN_CONFIDENCE } from "../ResultsHeader.constants";
import type {
  ResultsHeaderOrientation,
  ResultsHeaderResult,
} from "../ResultsHeader.types";

export const getHeaderResult = (
  orientation?: ResultsHeaderOrientation,
  confidence?: number,
): ResultsHeaderResult | null => {
  if (!orientation || !isNumber(confidence)) return null;

  const band = getMatchBand(confidence);

  if (band === "none") return null;

  return {
    name: orientation.name,
    imageUrl: orientation.imageUrl,
    confidence: clamp(confidence, MIN_CONFIDENCE, MAX_CONFIDENCE),
    band,
  };
};
