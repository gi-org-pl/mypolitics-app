import type { ReactNode } from "react";

// Whether a node has anything to draw. Nothing, a boolean and an empty string
// draw nothing, and neither does a list that holds only such nodes. An
// element always counts: what it renders is not known here.
export const hasContent = (node: ReactNode): boolean =>
  Array.isArray(node)
    ? node.some(hasContent)
    : node !== null &&
      node !== undefined &&
      typeof node !== "boolean" &&
      node !== "";
