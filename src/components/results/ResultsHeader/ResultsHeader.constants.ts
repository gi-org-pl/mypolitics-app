import type { ResultsHeaderBand } from "./ResultsHeader.types";

export const MIN_CONFIDENCE = 0;
export const MAX_CONFIDENCE = 100;

export const BAND_CLASS_NAME: Record<ResultsHeaderBand, string> = {
  partial: "text-gi-orange",
  match: "text-gi-green",
};

export const IMAGE_CLASS_NAME = "absolute inset-[5px] size-[55px] rounded-full";
