import { z } from "zod";

import {
  RESULT_MODULE_COLUMNS,
  RESULT_MODULE_DEFAULTS,
  RESULT_MODULE_TYPES,
} from "@/constants/results";
import { trimmedTextSchema } from "@/utils/zod/trimmedTextSchema";

const NOT_BLANK_PATTERN = /\S/;

const text = trimmedTextSchema.optional().catch(undefined);
const list = z.array(z.unknown()).optional().catch(undefined);
const slots = z
  .record(z.string(), z.string().optional().catch(undefined))
  .catch({});

// A parameter is a number, a text, a boolean, null, or a list of those. The
// names are not known here and no value is checked against what its name may
// hold: a record is kept as it was saved, and whoever needs a parameter reads
// it by its definition.
const paramScalar = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const paramValue = z.union([paramScalar, z.array(paramScalar)]);
const params = z
  .record(z.string(), paramValue.optional().catch(undefined))
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
  params,
  labels: slots,
  colors: slots,
});

export type ResultModuleResponse = z.infer<typeof resultModuleResponseSchema>;
