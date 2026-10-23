import type { Orientation } from "@/types/orientation";
import type { ResultModuleLowMatch } from "@/types/results";
import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";
import { getMatchBand } from "@/utils/results/getMatchBand";

import { MAX_CONFIDENCE, MIN_CONFIDENCE } from "../ResultsHeader.constants";
import type { ResultsHeaderResult } from "../ResultsHeader.types";

// The result the header names: the orientation with its confidence and the
// band the confidence falls into. There is none - the header then says that
// nothing matches - without an orientation or a confidence, and below a
// partial match unless the header is set to name the orientation all the
// same.
export const getHeaderResult = (
  orientation?: Pick<Orientation, "name" | "imageUrl">,
  confidence?: number,
  lowMatch: ResultModuleLowMatch = "no_match",
): ResultsHeaderResult | null => {
  if (!orientation || !isNumber(confidence)) return null;

  const band = getMatchBand(confidence);

  if (band === "none" && lowMatch !== "named") return null;

  return {
    name: orientation.name ?? "",
    imageUrl: orientation.imageUrl,
    confidence: clamp(confidence, MIN_CONFIDENCE, MAX_CONFIDENCE),
    band,
  };
};
