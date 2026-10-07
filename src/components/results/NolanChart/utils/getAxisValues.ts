import type { NolanAxis, NolanAxisValues } from "../NolanChart.types";

export const getAxisValues = (axis?: NolanAxis): NolanAxisValues => ({
  start: axis?.start?.entry?.value,
  end: axis?.end?.entry?.value,
});
