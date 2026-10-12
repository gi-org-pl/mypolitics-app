import type { ReactNode, RefObject } from "react";

export interface AnimatedHeightProps {
  durationMs?: number; // how long a change of height takes; 300 by default
  children: ReactNode;
}

export interface AnimatedHeightRefs {
  boxRef: RefObject<HTMLDivElement | null>; // the box whose height moves
  contentRef: RefObject<HTMLDivElement | null>; // the content, whose height is watched
}
