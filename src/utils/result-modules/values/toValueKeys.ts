// The keys of the places a module has of its own: each name behind the prefix
// that says what kind of value follows.
export const toValueKeys = <Prefix extends string, Name extends string>(
  prefix: Prefix,
  names: readonly Name[],
) => names.map((name) => `${prefix}${name}` as const);
