import { resultModuleResponseSchema } from "@/services/api/schemas/resultModule";
import type { ResultModule } from "@/types/results";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { parseItems } from "@/utils/zod/parseItems";

import { orderResultModules } from "./orderResultModules";
import { toResultModule } from "./toResultModule";

// The list is read item by item, so that one bad record never costs the quiz
// its others. A record is dropped before the duplicates are, so that the one
// kept is the first that can be placed.
export const readResultModules = (
  response: unknown,
  known: { orientationIds: ReadonlySet<string>; axisIds: ReadonlySet<string> },
): ResultModule[] =>
  orderResultModules(
    uniqueBy(
      parseItems(response, resultModuleResponseSchema),
      ({ id }) => id,
    ).map((record) => toResultModule(record, known)),
  );
