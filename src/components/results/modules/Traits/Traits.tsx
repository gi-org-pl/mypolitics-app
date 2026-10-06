import { Trans } from "@lingui/react/macro";

import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";

import { TraitPill } from "./TraitPill/TraitPill";
import type { TraitsProps } from "./Traits.types";
import { getTraitItems } from "./utils/getTraitItems";

export const Traits = ({
  title,
  traits,
  earnedIds,
  comparison,
  onStatsClick,
  onInfoClick,
}: TraitsProps) => {
  const items = getTraitItems({ traits, earnedIds, comparison });

  return (
    <ModuleWrapper
      title={title}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      {items.length > 0 ? (
        <ul className="flex min-w-0 flex-wrap gap-2.5">
          {items.map((item) => (
            <TraitPill key={item.id} item={item} party={comparison?.party} />
          ))}
        </ul>
      ) : (
        <p className="text-base leading-5 text-gi-primary">
          <Trans>Brak zdobytych cech</Trans>
        </p>
      )}
    </ModuleWrapper>
  );
};
