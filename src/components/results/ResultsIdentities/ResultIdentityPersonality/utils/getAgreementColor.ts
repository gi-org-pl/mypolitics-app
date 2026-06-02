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
