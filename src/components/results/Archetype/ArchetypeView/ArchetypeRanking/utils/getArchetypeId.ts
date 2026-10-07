import type { ArchetypeEntry } from "../../../Archetype.types";

export const getArchetypeId = (archetype: ArchetypeEntry): string =>
  archetype.orientation?.id ?? "";
