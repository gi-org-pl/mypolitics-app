import { useLingui } from "@lingui/react/macro";

import alignLeftIcon from "@/assets/icons/align-left.svg";
import chevronDownIcon from "@/assets/icons/chevron-down.svg";

import type {
  ArchetypeContent,
  ArchetypeOpenableView,
  ArchetypeView,
} from "../Archetype.types";
import { ArchetypeControl } from "./ArchetypeControl/ArchetypeControl";
import { ArchetypeRankingPreview } from "./ArchetypeRankingPreview/ArchetypeRankingPreview";

interface ArchetypeFootProps {
  openView: ArchetypeView;
  content: ArchetypeContent;
  onToggle: (view: ArchetypeOpenableView) => void;
}

export const ArchetypeFoot = ({
  openView,
  content,
  onToggle,
}: ArchetypeFootProps) => {
  const { t } = useLingui();
  const { hasDescription, hasRanking, ranking } = content;
  const isRankingOpen = openView === "ranking";

  if (!hasDescription && !hasRanking) return null;

  return (
    <div
      data-testid="archetype-foot"
      className="-mx-4 -mb-4 flex border-t border-gi-ash"
    >
      {hasDescription && (
        <ArchetypeControl
          label={t`Pełny opis`}
          isOpen={openView === "description"}
          onClick={() => onToggle("description")}
        >
          <img src={alignLeftIcon} alt="" />
        </ArchetypeControl>
      )}
      {hasRanking && (
        <ArchetypeControl
          label={t`Ranking`}
          isOpen={isRankingOpen}
          hasDivider={hasDescription}
          onClick={() => onToggle("ranking")}
        >
          <ArchetypeRankingPreview ranking={ranking} />
          <img
            src={chevronDownIcon}
            alt=""
            className={isRankingOpen ? "rotate-180" : undefined}
          />
        </ArchetypeControl>
      )}
    </div>
  );
};
