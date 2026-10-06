import { useLingui } from "@lingui/react/macro";

import { toSingleLine } from "@/utils/text/toSingleLine";

import type {
  NolanPosition,
  NolanQuadrants,
  NolanTitle,
} from "../NolanChart.types";
import { getQuadrantColor } from "./getQuadrantColor";
import { getQuadrantName } from "./getQuadrantName";

export const useNolanTitle = (
  position: NolanPosition | null,
  quadrants?: Partial<NolanQuadrants>,
  centreName?: string,
): NolanTitle => {
  const { t } = useLingui();

  if (!position) return { name: t`Brak wyniku`, shortName: "", look: "plain" };

  const { level } = position;
  const quadrantName = getQuadrantName(quadrants, position);

  if (level === "centre" || !quadrantName.name) {
    return { name: toSingleLine(centreName), shortName: "", look: "plain" };
  }

  return {
    ...quadrantName,
    look: level,
    color: getQuadrantColor(quadrants, position),
  };
};
