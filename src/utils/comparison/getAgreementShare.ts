import { Agreement } from "@/types/comparison";

const WHOLE = 100;

// The share of agreeing questions among the questions that agree or
// disagree, times 100, rounded to a whole number. A question that is neither
// is not counted. There is no share when no question agrees or disagrees.
export const getAgreementShare = (
  agreements: readonly Agreement[],
): number | undefined => {
  const agreeing = agreements.filter((one) => one === Agreement.Agree).length;
  const disagreeing = agreements.filter(
    (one) => one === Agreement.Disagree,
  ).length;
  const counted = agreeing + disagreeing;

  return counted > 0 ? Math.round((agreeing / counted) * WHOLE) : undefined;
};
