import { z } from "zod";

import { SURVEY_PHASES, SURVEY_SESSION_VERSION } from "@/constants/survey";

const storedEntrySchema = z.object({
  questionId: z.string(),
  answerId: z.string().optional(),
});

const storedTimeSampleSchema = z.object({
  questionId: z.string(),
  seconds: z.number().min(0),
});

const storedCheckpointRecordSchema = z.object({
  cardsShown: z.array(z.unknown()),
  timeSamples: z.array(storedTimeSampleSchema.optional().catch(undefined)),
});

// The record of a quiz as the store writes it. A record that does not pass is
// thrown away as a whole. Three parts are read more gently, so that they cost
// the taker as little as they can: an entry or a time sample that cannot be
// read is left as nothing in its place, a phase that is not one of the seven
// is no phase, and a checkpoint record that cannot be read is an empty one.
export const storedSessionSchema = z.object({
  version: z.literal(SURVEY_SESSION_VERSION),
  state: z.object({
    id: z.uuid(),
    surveyId: z.string(),
    entries: z.array(storedEntrySchema.optional().catch(undefined)),
    prioritizedCategoryIds: z.array(z.unknown()),
    areCategoriesConfirmed: z.boolean(),
    phase: z.enum(SURVEY_PHASES).optional().catch(undefined),
    areCheckpointsOff: z.boolean(),
    demographics: z.record(z.string(), z.unknown()),
    areDemographicsGiven: z.boolean(),
    checkpointRecord: storedCheckpointRecordSchema.catch(() => ({
      cardsShown: [],
      timeSamples: [],
    })),
  }),
});
