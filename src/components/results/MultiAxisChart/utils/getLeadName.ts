import { getAxisLead } from "@/utils/results/getAxisLead";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { AxisPair } from "../MultiAxisChart.types";

export const getLeadName = (axis: AxisPair): string => {
  const lead = getAxisLead(axis.start?.value, axis.end?.value);

  return lead === null ? "" : toSingleLine(axis[lead]?.orientation?.name);
};
