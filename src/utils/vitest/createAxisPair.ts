import type { ResultEntry } from "@/types/results";

export const createAxisPair = (
  id: string,
  startName: string,
  endName: string,
  startValue?: number,
  endValue?: number,
): { id: string; start: ResultEntry; end: ResultEntry } => ({
  id,
  start: {
    orientation: {
      id: `${id}-start`,
      name: startName,
      imageUrl: `https://example.com/${id}-start.svg`,
      color: "#9b59b6",
    },
    value: startValue,
  },
  end: {
    orientation: {
      id: `${id}-end`,
      name: endName,
      imageUrl: `https://example.com/${id}-end.svg`,
      color: "#1abc9c",
    },
    value: endValue,
  },
});
