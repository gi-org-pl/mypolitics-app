import type { ScoreTotal } from "@/types/checkpoint";

export const addScoreTotals = (
  total: ScoreTotal,
  added: ScoreTotal,
): ScoreTotal => ({
  points: total.points + added.points,
  maximum: total.maximum + added.maximum,
});
