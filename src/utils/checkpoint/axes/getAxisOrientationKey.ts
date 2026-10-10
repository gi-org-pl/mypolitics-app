import type { CheckpointAxisSides } from "@/types/checkpoint";

// What makes two axes one for the cards: the orientations they are about,
// whichever side each stands on. An axis of the running state and an axis
// card about the same orientations have the same key.
export const getAxisOrientationKey = (axis: CheckpointAxisSides): string =>
  JSON.stringify(
    ("entry" in axis ? [axis.entry] : [axis.start, axis.end])
      .map(({ orientation }) => orientation.id)
      .sort(),
  );
