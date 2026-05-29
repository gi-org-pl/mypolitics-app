export function normalizePercentages(
  left: number,
  right: number,
): { left: number; right: number } {
  const total = left + right;

  if (total === 0) {
    return { left: 50, right: 50 };
  }

  const factor = 100 / total;

  return {
    left: left * factor,
    right: right * factor,
  };
}
