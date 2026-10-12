import type { NolanAxisValues } from "@/types/results";

import type { NolanAxis } from "../NolanChart.types";

export const getAxisValues = (axis?: NolanAxis): NolanAxisValues => ({
  start: axis?.start?.entry?.value,
  end: axis?.end?.entry?.value,
});
