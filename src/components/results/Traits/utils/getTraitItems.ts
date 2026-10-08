import { toSingleLine } from "@/utils/text/toSingleLine";
import type { TraitHolder, TraitItem, TraitsProps } from "../Traits.types";

type TraitItemsInput = Pick<TraitsProps, "traits" | "earnedIds" | "comparison">;

const toIdSet = (ids?: string[]): Set<string> =>
  new Set(Array.isArray(ids) ? ids : []);

const getHolder = (
  isTakers: boolean,
  isTheirs: boolean,
): TraitHolder | null => {
  if (isTakers) return isTheirs ? "both" : "taker";

  return isTheirs ? "other" : null;
};

export const getTraitItems = ({
  traits,
  earnedIds,
  comparison,
}: TraitItemsInput): TraitItem[] => {
  const takerIds = toIdSet(earnedIds);
  const theirIds = toIdSet(comparison?.orientation ? comparison.earnedIds : []);
  const drawnIds = new Set<string>();
  const items: TraitItem[] = [];

  for (const trait of Array.isArray(traits) ? traits : []) {
    const name = toSingleLine(trait?.name);
    const holder = trait
      ? getHolder(takerIds.has(trait.id), theirIds.has(trait.id))
      : null;

    if (!name || !holder || drawnIds.has(trait.id)) continue;

    drawnIds.add(trait.id);
    items.push({ orientation: { ...trait, name }, holder });
  }

  return items;
};
