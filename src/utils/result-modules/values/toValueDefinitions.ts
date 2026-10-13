import type { ResultModuleValueDefinition } from "@/types/results";

// One definition for each key of a list: the entries of the table of
// definitions for keys that all hold the same.
export const toValueDefinitions = <
  Key extends string,
  Definition extends ResultModuleValueDefinition,
>(
  keys: readonly Key[],
  definition: Definition,
) =>
  // Every key of the list is a key of the result. TypeScript cannot follow an
  // object built key by key, so this place says so.
  Object.fromEntries(keys.map((key) => [key, definition])) as Record<
    Key,
    Definition
  >;
