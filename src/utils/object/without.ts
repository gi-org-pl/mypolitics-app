// A copy of a record without one of its keys; the record itself is left as
// it is.
export const without = <Value>(
  record: Record<string, Value>,
  key: string,
): Record<string, Value> =>
  Object.fromEntries(Object.entries(record).filter(([id]) => id !== key));
