import { z } from "zod";

import { MAX_AXIS_VALUE, MIN_AXIS_VALUE } from "@/constants/axis";
import {
  CHECKPOINT_MIN_DONE,
  HALFWAY_MAX_MINUTES,
  MIDPOINT_SHARE,
  MIN_MINUTES_LEFT,
  NOLAN_PATH_ALL_QUADRANTS,
  NOLAN_PATH_MIN_DONE,
  NOLAN_PATH_MIN_QUADRANTS,
  POSITION_PUZZLE_DISTRACTORS,
  SINGLE_AXIS_MIN_VALUE,
  STATS_MAX_PERCENT,
  STATS_MIN_PERCENT,
  STATS_MIN_SAMPLE,
  TWO_SIDED_AXIS_MIN_LEAN,
  WHOLE_PERCENT,
} from "@/constants/checkpoint";
import { PARTIAL_MATCH_FROM } from "@/constants/results";
import type { NolanLevel, NolanQuadrantKey } from "@/types/results";

// A coordinate of the compass runs from -1 to 1.
const COMPASS_EDGE = 1;
const NOLAN_LEVELS = [
  "centre",
  "moderate",
  "extreme",
] as const satisfies readonly NolanLevel[];
const NOLAN_QUADRANTS = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
] as const satisfies readonly NolanQuadrantKey[];

const countSchema = z.number().int().min(0);
// The value of an orientation, and the closeness of an archetype: 0 to 100.
const valueSchema = z.number().min(MIN_AXIS_VALUE).max(MAX_AXIS_VALUE);
const coordinateSchema = z.number().min(-COMPASS_EDGE).max(COMPASS_EDGE);

// An orientation is taken as one when it has an identifier. Its shape has one
// definition in the app, and it is not written a second time here.
const orientationSchema = z.object({ id: z.string() });

const entrySchema = z.object({
  orientation: orientationSchema,
  value: valueSchema,
});

const trailSchema = z
  .array(
    z.object({
      x: coordinateSchema,
      y: coordinateSchema,
      level: z.enum(NOLAN_LEVELS),
      quadrant: z.enum(NOLAN_QUADRANTS),
      done: countSchema,
    }),
  )
  .min(1);

// What every card carries. No card comes before the first boundary the
// pacing opens.
const base = {
  boundary: countSchema.min(CHECKPOINT_MIN_DONE),
  line: z.object({ pool: z.string(), index: countSchema }),
};

const nolanPath = {
  ...base,
  type: z.literal("nolan-path"),
  boundary: countSchema.min(NOLAN_PATH_MIN_DONE),
  trail: trailSchema,
};

// The two sides of an axis, the leading one ahead by the lean an axis card
// needs - so it is the higher one.
const pairSchema = z
  .object({
    ...base,
    axisId: z.string(),
    start: entrySchema,
    end: entrySchema,
    leadingSide: z.enum(["start", "end"]),
  })
  .refine(
    ({ start, end, leadingSide }) =>
      (leadingSide === "start"
        ? start.value - end.value
        : end.value - start.value) >= TWO_SIDED_AXIS_MIN_LEAN,
  );

// A card as the store of the tab wrote it: one of the seven types, with every
// value its variant has, each of the kind and in the range the card type
// gives it - the thresholds of its trigger included, wherever the card holds
// the value they are measured on: a card the engine could not have handed
// over is no card. The stats card has the sample and the rare side its chart
// needs; the position puzzle has three different rows and the leader is one
// of them; a Nolan path has a trail to stand on, and counts four quadrants
// exactly when it is the full one; an axis leans as far as an axis card
// needs. Whether the card can be put into words is not checked here.
export const storedCardSchema = z.union([
  z
    .object({
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
    })
    .refine(({ side, counts }) => {
      const sample = counts.for + counts.against;

      return (
        sample >= STATS_MIN_SAMPLE &&
        counts[side] * WHOLE_PERCENT <=
          STATS_MAX_PERCENT * (sample + counts.noAnswer)
      );
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
      closeness: valueSchema.min(PARTIAL_MATCH_FROM),
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
    ...base,
    type: z.literal("axis-closeness"),
    axisId: z.string(),
    variant: z.literal("single"),
    entry: entrySchema.extend({
      value: valueSchema.min(SINGLE_AXIS_MIN_VALUE),
    }),
  }),
  pairSchema.and(
    z.object({
      type: z.literal("axis-closeness"),
      variant: z.literal("double"),
    }),
  ),
  pairSchema.and(z.object({ type: z.literal("axis-puzzle") })),
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
