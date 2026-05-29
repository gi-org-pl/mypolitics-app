import {
  AGREEMENT_HIGH_THRESHOLD,
  AGREEMENT_LOW_THRESHOLD,
} from "../ResultsHeader.constants";

export type AgreementLevel = "high" | "mid" | "low";

export function getAgreementLevel(percent: number): AgreementLevel {
  if (percent >= AGREEMENT_HIGH_THRESHOLD) {
    return "high";
  }

  if (percent < AGREEMENT_LOW_THRESHOLD) {
    return "low";
  }

  return "mid";
}
