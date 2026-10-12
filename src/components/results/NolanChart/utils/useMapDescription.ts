import { useLingui } from "@lingui/react/macro";

import type { NolanPosition } from "@/types/results";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { NolanQuadrants } from "../NolanChart.types";
import { formatCoordinate } from "./formatCoordinate";
import { getQuadrantName } from "./getQuadrantName";

export interface MapDescriptionInput {
  title: string;
  horizontalName: string;
  verticalName: string;
  position: NolanPosition | null;
  otherName?: string;
  otherPosition: NolanPosition | null;
  quadrants?: Partial<NolanQuadrants>;
  centreName?: string;
}

export const useMapDescription = ({
  title,
  horizontalName: xAxis,
  verticalName: yAxis,
  position,
  otherName,
  otherPosition,
  quadrants,
  centreName,
}: MapDescriptionInput): string => {
  const { t } = useLingui();

  const parts: string[] = [];

  if (position) {
    const x = formatCoordinate(position.x);
    const y = formatCoordinate(position.y);

    parts.push(
      title
        ? t`${title}. ${xAxis}: ${x}, ${yAxis}: ${y}`
        : t`${xAxis}: ${x}, ${yAxis}: ${y}`,
    );
  } else {
    parts.push(title);
  }

  const name = toSingleLine(otherName);
  const quadrant = otherPosition
    ? getQuadrantName(quadrants, otherPosition).name || toSingleLine(centreName)
    : "";

  if (name && quadrant) parts.push(t`${name}: ${quadrant}`);

  return parts.join(". ");
};
