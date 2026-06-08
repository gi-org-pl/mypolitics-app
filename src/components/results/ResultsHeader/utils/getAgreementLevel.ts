import {
  AGREEMENT_HIGH_THRESHOLD,
  AGREEMENT_LOW_THRESHOLD,
} from "../ResultsHeader.constants";

export type AgreementLevel = "high" | "mid" | "low";

export function getAgreementLevel(agreementPercent: number): AgreementLevel {
  if (agreementPercent >= AGREEMENT_HIGH_THRESHOLD) {
    return "high";
  }

  if (agreementPercent >= AGREEMENT_LOW_THRESHOLD) {
    return "mid";
  }

  return "low";
}
