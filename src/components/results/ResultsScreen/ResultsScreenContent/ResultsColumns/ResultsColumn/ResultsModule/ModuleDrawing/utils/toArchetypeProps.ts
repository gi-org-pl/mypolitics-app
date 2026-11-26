import type { ArchetypeProps } from "@/components/results/Archetype/Archetype.types";

import type { ResolvedModuleOf } from "../ModuleDrawing.types";

// The value of an entry is its match.
export const toArchetypeProps = ({
  title,
  entries,
}: ResolvedModuleOf<"archetype">): ArchetypeProps => ({
  title,
  archetypes: entries.map(({ orientation, value }) => ({
    orientation,
    match: value,
  })),
});
