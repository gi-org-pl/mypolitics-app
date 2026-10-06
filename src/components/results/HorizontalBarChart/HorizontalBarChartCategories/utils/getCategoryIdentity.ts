import { toSingleLine } from "@/utils/text/toSingleLine";

import type { RankedCategory } from "../../HorizontalBarChart.types";

export const getCategoryIdentity = (category?: RankedCategory): string =>
  typeof category?.id === "string"
    ? `id:${category.id}`
    : `name:${toSingleLine(category?.name)}`;
