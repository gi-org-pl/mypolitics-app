import type { ResultEntry } from "@/types/results";

import type { NolanPole } from "../NolanChart.types";

export const getRowEntry = (pole: NolanPole, color?: string): ResultEntry => ({
  ...pole.entry,
  orientation: { ...pole.entry.orientation, color },
});
