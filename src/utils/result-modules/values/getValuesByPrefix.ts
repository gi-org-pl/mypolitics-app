// The values of the keys that start with a prefix, by the name behind it. A
// key that has no value is left out.
export const getValuesByPrefix = (
  values: Record<string, string | undefined>,
  prefix: string,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(values).flatMap(([key, value]) =>
      key.startsWith(prefix) && value !== undefined
        ? [[key.slice(prefix.length), value]]
        : [],
    ),
  );
