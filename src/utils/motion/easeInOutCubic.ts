// Eases a share of a movement, 0 to 1, in and out: slow at both ends and
// fastest halfway. Shares outside 0 to 1 are held at the nearer end.
export const easeInOutCubic = (share: number): number => {
  if (share <= 0) return 0;
  if (share >= 1) return 1;

  return share < 0.5 ? 4 * share ** 3 : 1 - (-2 * share + 2) ** 3 / 2;
};
