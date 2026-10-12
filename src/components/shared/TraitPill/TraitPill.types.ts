import type { Orientation } from "@/types/orientation";

export type TraitHolder = "taker" | "both" | "other";

export interface TraitPillProps {
  orientation: Orientation; // the trait: name, icon (imageUrl), colour
  holder?: TraitHolder; // default "taker". Who holds the trait, in a comparison
  otherOrientation?: Orientation; // the other party of a comparison; its imageUrl is the avatar
}
