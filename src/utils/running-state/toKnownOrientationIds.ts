// The listed identifiers that are orientations of the quiz, each once, in the
// order listed. It reads what a possible answer supports and what a side of
// an axis holds.
export const toKnownOrientationIds = (
  ids: readonly string[],
  orientationIds: ReadonlySet<string>,
): string[] => [...new Set(ids)].filter((id) => orientationIds.has(id));
