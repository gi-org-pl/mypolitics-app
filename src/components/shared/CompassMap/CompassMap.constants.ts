import type { NolanQuadrantKey } from "@/types/results";

export const QUADRANT_KEYS: NolanQuadrantKey[] = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

export const MAP_CLIP_CLASS_NAME =
  "pointer-events-none absolute inset-0 overflow-hidden rounded-xl";
export const MAP_POINT_CLASS_NAME =
  "absolute top-(--nolan-y) left-(--nolan-x) -translate-1/2 rounded-full";
