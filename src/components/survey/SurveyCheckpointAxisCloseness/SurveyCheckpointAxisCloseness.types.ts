import type { AxisEntry } from "@/types/axis";

// What the card draws in the visual, worked out from its card member.
export interface AxisClosenessBar {
  title: string; // the name the title shows, on one line
  start: AxisEntry; // the entry on the start cap
  end?: AxisEntry; // the entry on the end cap. Present = the double variant
}
