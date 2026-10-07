import { useLingui } from "@lingui/react/macro";

import type { OrientationChipProps } from "@/components/results/OrientationChip/OrientationChip.types";
import type { ResultEntry } from "@/types/results";
import { getAxisLead } from "@/utils/results/getAxisLead";
import { hasOrientationTitle } from "@/utils/results/hasOrientationTitle";
import { toSingleLine } from "@/utils/text/toSingleLine";

export interface DoubleAxisTitle {
  name: string;
  chip?: OrientationChipProps;
}

export const useDoubleAxisTitle = (
  start: ResultEntry,
  end: ResultEntry,
): DoubleAxisTitle => {
  const { t } = useLingui();

  const lead = getAxisLead(start.value, end.value);

  if (lead !== null) {
    const { orientation } = { start, end }[lead];
    const name = toSingleLine(orientation.name);

    return {
      name,
      chip: hasOrientationTitle(orientation)
        ? {
            name,
            imageUrl: orientation.imageUrl,
            color: orientation.color,
            look: "emphasised",
          }
        : undefined,
    };
  }

  const startName = toSingleLine(start.orientation.name);
  const endName = toSingleLine(end.orientation.name);
  const name =
    startName && endName ? t`${startName} / ${endName}` : startName || endName;

  return { name, chip: name ? { name, look: "neutral" } : undefined };
};
