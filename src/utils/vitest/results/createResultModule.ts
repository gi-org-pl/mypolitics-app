import { RESULT_MODULE_DEFAULTS } from "@/constants/results";
import type {
  ResultModule,
  ResultModuleOf,
  ResultModuleType,
} from "@/types/results";

// A record of a result module for a test quiz: placed first, pointed at
// nothing, with no parameter set and every other field at its default. The
// record is of the type given, whatever the overrides hold.
export const createResultModule = <Type extends ResultModuleType>(
  id: string,
  type: Type,
  overrides: Partial<ResultModule> = {},
): ResultModuleOf<Type> => ({
  position: 0,
  orientationIds: [],
  axisIds: [],
  params: {},
  labels: {},
  colors: {},
  ...RESULT_MODULE_DEFAULTS,
  ...overrides,
  id,
  type,
});
