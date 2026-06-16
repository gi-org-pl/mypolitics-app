import {
  AGREEMENT_HIGH_THRESHOLD,
  AGREEMENT_LOW_THRESHOLD,
} from "../ResultsHeader.constants";
import type { AgreementLevel } from "../ResultsHeader.types";

export const getAgreementLevel = (agreementPercent: number): AgreementLevel => {
  if (agreementPercent >= AGREEMENT_HIGH_THRESHOLD) {
    return "high";
  }

  if (agreementPercent >= AGREEMENT_LOW_THRESHOLD) {
    return "mid";
  }

  return "low";
};
