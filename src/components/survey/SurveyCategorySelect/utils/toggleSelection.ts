export function toggleSelection(
  ids: string[],
  id: string,
  max: number,
): string[] {
  if (ids.includes(id)) {
    return ids.filter((existingId) => existingId !== id);
  }

  if (ids.length < max) {
    return [...ids, id];
  }

  return ids;
}