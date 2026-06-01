/**
 * Returns the tailwind color class based on the agreement percentage.
 *
 * Thresholds (based on legacy ResultPersonalityAggreement):
 * - >= 66%: Green (strong)
 * - >= 33%: Orange (medium)
 * - < 33%: Red (weak)
 */
export const getAgreementColor = (percent: number): string => {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  if (clampedPercent >= 66) {
    return "text-gi-green";
  }

  if (clampedPercent >= 33) {
    return "text-gi-orange";
  }

  return "text-gi-red";
};
