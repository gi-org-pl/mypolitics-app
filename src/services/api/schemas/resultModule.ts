import { z } from "zod";

import {
  RESULT_MODULE_COLUMNS,
  RESULT_MODULE_DEFAULTS,
  RESULT_MODULE_TYPES,
} from "@/constants/results";

const NOT_BLANK_PATTERN = /\S/;

const list = z.array(z.unknown()).optional().catch(undefined);

// A pair of a key and a value. A value is a string or a whole
// number. The keys are not known here and no value is checked against what its
// key may hold: a pair is kept as it was saved, and whoever needs a value
// reads it by the definition of its key.
export const resultModulePairSchema = z.object({
  key: z.string().regex(NOT_BLANK_PATTERN),
  value: z.union([z.string(), z.number().int()]),
});

// A record that can be placed: one without an identifier, a known type or a
// position does not pass. Every other field that is missing or cannot be read
// holds its default, so that one bad field never costs the quiz the module.
// The values are a list that is read pair by pair, for the same reason.
// Nothing else a record sends is read.
export const resultModuleResponseSchema = z.object({
  id: z.string().regex(NOT_BLANK_PATTERN),
  type: z.enum(RESULT_MODULE_TYPES),
  position: z.number(),
  column: z.enum(RESULT_MODULE_COLUMNS).catch(RESULT_MODULE_DEFAULTS.column),
  orientationIds: list,
  axisIds: list,
  values: list,
});

export type ResultModuleResponse = z.infer<typeof resultModuleResponseSchema>;
