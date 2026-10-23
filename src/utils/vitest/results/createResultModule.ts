import { RESULT_MODULE_DEFAULTS } from "@/constants/results";
import type { ResultModule, ResultModuleType } from "@/types/results";

// A record of a result module for a test quiz: placed first, pointed at
// nothing, with every other field at its default.
export const createResultModule = (
  id: string,
  type: ResultModuleType,
  overrides: Partial<ResultModule> = {},
): ResultModule => ({
  id,
  type,
  position: 0,
  orientationIds: [],
  axisIds: [],
  labels: {},
  colors: {},
  ...RESULT_MODULE_DEFAULTS,
  ...overrides,
});
