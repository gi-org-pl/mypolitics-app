import { useLingui } from "@lingui/react/macro";

import { toSingleLine } from "@/utils/text/toSingleLine";

import type { AxisGroup } from "../MultiAxisChart.types";
import { getLeadName } from "./getLeadName";

export const useGroupName = (group: AxisGroup): string => {
  const { t } = useLingui();

  const [headline] = group.axes;
  const startName = toSingleLine(headline.start?.orientation?.name);
  const endName = toSingleLine(headline.end?.orientation?.name);
  const tieName =
    startName && endName ? t`${startName} / ${endName}` : startName || endName;

  return toSingleLine(group.name) || getLeadName(headline) || tieName;
};
