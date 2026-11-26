import type { ArchetypeProps } from "@/components/results/Archetype/Archetype.types";

import type { ResolvedModuleOf } from "../../ModuleDrawing.types";

// The value of an entry is its match. What the card does with a leader below
// a partial match is its record's to say.
export const toArchetypeProps = ({
  title,
  entries,
  lowMatch,
}: ResolvedModuleOf<"archetype">): ArchetypeProps => ({
  title,
  lowMatch,
  archetypes: entries.map(({ orientation, value }) => ({
    orientation,
    match: value,
  })),
});
