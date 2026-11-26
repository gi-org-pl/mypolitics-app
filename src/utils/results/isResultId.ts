import { z } from "zod";

const resultIdSchema = z.uuidv4();

// A result identifier is the identifier of the session it was handed in from:
// a version 4 UUID. The API refuses anything else, so anything else is never
// sent to it.
export const isResultId = (resultId: string): boolean =>
  resultIdSchema.safeParse(resultId).success;
