export const toKnownIds = (
  ids: unknown[] | undefined,
  knownIds: ReadonlySet<string>,
): string[] =>
  (ids ?? []).filter(
    (id): id is string => typeof id === "string" && knownIds.has(id),
  );
