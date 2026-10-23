import type { TraitsProps } from "@/components/results/Traits/Traits.types";

import type { ResolvedModuleOf } from "../ModuleDrawing.types";

// The catalogue and the earned traits go as they are.
export const toTraitsProps = ({
  title,
  traits,
  earnedIds,
}: ResolvedModuleOf<"traits">): TraitsProps => ({
  title,
  traits,
  earnedIds,
});
