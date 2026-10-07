import type { ResultEntry } from "@/types/results";

import { createOrientation } from "./createOrientation";

export const createAxisPair = (
  id: string,
  startName: string,
  endName: string,
  startValue?: number,
  endValue?: number,
): { id: string; start: ResultEntry; end: ResultEntry } => ({
  id,
  start: {
    orientation: createOrientation(`${id}-start`, startName, {
      imageUrl: `https://example.com/${id}-start.svg`,
      color: "#9b59b6",
    }),
    value: startValue,
  },
  end: {
    orientation: createOrientation(`${id}-end`, endName, {
      imageUrl: `https://example.com/${id}-end.svg`,
      color: "#1abc9c",
    }),
    value: endValue,
  },
});
