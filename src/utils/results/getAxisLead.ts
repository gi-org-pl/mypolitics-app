const MIN_VALUE = 0;
const MAX_VALUE = 100;

export type AxisLead = "start" | "end" | null;

const getDisplayedValue = (value?: number): number =>
  typeof value === "number" && !Number.isNaN(value)
    ? Math.round(Math.min(MAX_VALUE, Math.max(MIN_VALUE, value)))
    : MIN_VALUE;

export const getAxisLead = (start?: number, end?: number): AxisLead => {
  const displayedStart = getDisplayedValue(start);
  const displayedEnd = getDisplayedValue(end);

  if (displayedStart > displayedEnd) return "start";
  if (displayedEnd > displayedStart) return "end";

  return null;
};
