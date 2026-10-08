import { z } from "zod";

import {
  HALFWAY_MAX_MINUTES,
  MIDPOINT_SHARE,
  MIN_MINUTES_LEFT,
  NOLAN_PATH_ALL_QUADRANTS,
  NOLAN_PATH_MIN_QUADRANTS,
  POSITION_PUZZLE_DISTRACTORS,
  STATS_MAX_PERCENT,
  STATS_MIN_PERCENT,
  WHOLE_PERCENT,
} from "@/constants/checkpoint";
import { PARTIAL_MATCH_FROM } from "@/constants/results";

const countSchema = z.number().int().min(0);
const sideSchema = z.enum(["start", "end"]);

// An orientation is taken as one when it has an identifier. Its shape has one
// definition in the app, and it is not written a second time here.
const orientationSchema = z.object({ id: z.string() });

const entrySchema = z.object({
  orientation: orientationSchema,
  value: z.number(),
});

const trailSchema = z
  .array(
    z.object({
      x: z.number(),
      y: z.number(),
      level: z.string(),
      quadrant: z.string(),
      done: z.number().int(),
    }),
  )
  .min(1);

// What every card carries.
const base = {
  boundary: z.number().int(),
  line: z.object({ pool: z.string(), index: z.number().int() }),
};

const axis = { ...base, axisId: z.string() };

const pair = { start: entrySchema, end: entrySchema, leadingSide: sideSchema };

const nolanPath = {
  ...base,
  type: z.literal("nolan-path"),
  trail: trailSchema,
};

// A card as the store of the tab wrote it: one of the seven types, with every
// value its variant has, each of the kind and in the range the card type
// gives it. The position puzzle has three different rows and the leader is
// one of them; a Nolan path has a trail to stand on, and counts four
// quadrants exactly when it is the full one. Whether the card can be put
// into words is not checked here.
export const storedCardSchema = z.union([
  z.object({
    ...base,
    type: z.literal("stats"),
    questionId: z.string(),
    thesis: z.string(),
    side: z.enum(["for", "against"]),
    counts: z.object({
      for: countSchema,
      against: countSchema,
      noAnswer: countSchema,
    }),
    percent: z.number().int().min(STATS_MIN_PERCENT).max(STATS_MAX_PERCENT),
  }),
  z.object({
    ...base,
    type: z.literal("new-trait"),
    trait: orientationSchema,
  }),
  z
    .object({
      ...base,
      type: z.literal("position-puzzle"),
      leader: orientationSchema,
      closeness: z.number().min(PARTIAL_MATCH_FROM),
      options: z
        .array(orientationSchema)
        .length(POSITION_PUZZLE_DISTRACTORS + 1),
    })
    .refine(({ leader, options }) => {
      const optionIds = new Set(options.map(({ id }) => id));

      return optionIds.size === options.length && optionIds.has(leader.id);
    }),
  z.object({
    ...nolanPath,
    variant: z.literal("partial"),
    count: z
      .number()
      .int()
      .min(NOLAN_PATH_MIN_QUADRANTS)
      .max(NOLAN_PATH_ALL_QUADRANTS - 1),
    isSecondPath: z.literal(false),
  }),
  z.object({
    ...nolanPath,
    variant: z.literal("full"),
    count: z.literal(NOLAN_PATH_ALL_QUADRANTS),
    isSecondPath: z.boolean(),
  }),
  z.object({
    ...axis,
    type: z.literal("axis-closeness"),
    variant: z.literal("single"),
    entry: entrySchema,
  }),
  z.object({
    ...axis,
    ...pair,
    type: z.literal("axis-closeness"),
    variant: z.literal("double"),
  }),
  z.object({ ...axis, ...pair, type: z.literal("axis-puzzle") }),
  z.object({
    ...base,
    type: z.literal("halfway"),
    percent: z
      .number()
      .int()
      .min(MIDPOINT_SHARE * WHOLE_PERCENT)
      .max(WHOLE_PERCENT),
    minutes: z.number().int().min(MIN_MINUTES_LEFT).max(HALFWAY_MAX_MINUTES),
  }),
]);
