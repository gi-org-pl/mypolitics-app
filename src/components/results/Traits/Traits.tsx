import { Trans } from "@lingui/react/macro";

import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";
import { TraitPill } from "@/components/shared/TraitPill/TraitPill";

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
          {items.map(({ orientation, holder }) => (
            <li key={orientation.id} className="flex max-w-full min-w-0">
              <TraitPill
                orientation={orientation}
                holder={holder}
                otherOrientation={comparison?.orientation}
              />
            </li>
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
