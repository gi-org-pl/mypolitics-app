import { useLingui } from "@lingui/react/macro";

import { toSingleLine } from "@/utils/text/toSingleLine";

import type { TraitHolder } from "../../Traits.types";

export const useTraitDescription = (
  trait: string,
  holder: TraitHolder,
  partyName?: string,
): string | undefined => {
  const { t } = useLingui();
  const name = toSingleLine(partyName);

  if (holder === "taker") return undefined;

  return holder === "other"
    ? t`${trait} - tylko ${name}`
    : t`${trait} - wspólna z: ${name}`;
};
