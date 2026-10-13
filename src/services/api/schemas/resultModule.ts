import { z } from "zod";

import { MAX_AXIS_VALUE, MIN_AXIS_VALUE } from "@/constants/axis";
import {
  RESULT_MODULE_COLUMNS,
  RESULT_MODULE_DEFAULTS,
  RESULT_MODULE_GROUPINGS,
  RESULT_MODULE_SELECTIONS,
  RESULT_MODULE_TYPES,
} from "@/constants/results";
import { trimmedTextSchema } from "@/utils/zod/trimmedTextSchema";

const NOT_BLANK_PATTERN = /\S/;

const text = trimmedTextSchema.optional().catch(undefined);
const list = z.array(z.unknown()).optional().catch(undefined);
const slots = z
  .record(z.string(), z.string().optional().catch(undefined))
  .catch({});

// A record that can be placed: one without an identifier, a known type or a
// position does not pass. Every other field that is missing or cannot be read
// holds its default, so that one bad field never costs the quiz the module.
export const resultModuleResponseSchema = z.object({
  id: z.string().regex(NOT_BLANK_PATTERN),
  type: z.enum(RESULT_MODULE_TYPES),
  position: z.number(),
  column: z.enum(RESULT_MODULE_COLUMNS).catch(RESULT_MODULE_DEFAULTS.column),
  title: text,
  description: text,
  orientationIds: list,
  axisIds: list,
  selection: z
    .enum(RESULT_MODULE_SELECTIONS)
    .catch(RESULT_MODULE_DEFAULTS.selection),
  groupBy: z
    .enum(RESULT_MODULE_GROUPINGS)
    .catch(RESULT_MODULE_DEFAULTS.groupBy),
  // `null` is the author switching the reference line off, not a missing value.
  marker: z
    .number()
    .min(MIN_AXIS_VALUE)
    .max(MAX_AXIS_VALUE)
    .nullable()
    .catch(RESULT_MODULE_DEFAULTS.marker),
  visibleRows: z.int().min(1).catch(RESULT_MODULE_DEFAULTS.visibleRows),
  labels: slots,
  colors: slots,
});

export type ResultModuleResponse = z.infer<typeof resultModuleResponseSchema>;
