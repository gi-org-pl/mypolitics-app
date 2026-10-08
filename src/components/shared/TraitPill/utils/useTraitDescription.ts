import { useLingui } from "@lingui/react/macro";

import { toSingleLine } from "@/utils/text/toSingleLine";

import type { TraitHolder } from "../TraitPill.types";

export const useTraitDescription = (
  trait: string,
  holder: TraitHolder,
  otherName?: string,
): string | undefined => {
  const { t } = useLingui();
  const name = toSingleLine(otherName);

  if (holder === "taker") return undefined;

  return holder === "other"
    ? t`${trait} - tylko ${name}`
    : t`${trait} - wspólna z: ${name}`;
};
