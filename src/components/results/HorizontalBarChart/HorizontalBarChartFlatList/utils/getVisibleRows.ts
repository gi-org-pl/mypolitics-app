import { isNumber } from "@/utils/number/isNumber";

import { DEFAULT_VISIBLE_ROWS } from "../../HorizontalBarChart.constants";

export const getVisibleRows = (visibleRows?: number): number =>
  isNumber(visibleRows) && Number.isInteger(visibleRows) && visibleRows >= 1
    ? visibleRows
    : DEFAULT_VISIBLE_ROWS;
