import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";

import type { ArchetypeProps } from "./Archetype.types";
import { ArchetypeFoot } from "./ArchetypeFoot/ArchetypeFoot";
import { ArchetypeLeader } from "./ArchetypeLeader/ArchetypeLeader";
import { ArchetypeView } from "./ArchetypeView/ArchetypeView";
import { getArchetypeContent } from "./utils/getArchetypeContent";
import { getArchetypeRanking } from "./utils/getArchetypeRanking";
import { useArchetypeView } from "./utils/useArchetypeView";

export const Archetype = ({
  title,
  archetypes,
  comparison,
  onStatsClick,
  onInfoClick,
}: ArchetypeProps) => {
  const { leader, rest } = getArchetypeRanking(archetypes);
  const content = getArchetypeContent(leader, rest);
  const { openView, toggleView } = useArchetypeView(content);

  return (
    <ModuleWrapper
      title={title}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      {leader && (
        <div className="flex flex-col gap-4">
          <ArchetypeLeader
            leader={leader}
            isMatched={content.isMatched}
            comparison={comparison}
          />
          <ArchetypeView
            openView={openView}
            content={content}
            comparison={comparison}
          />
          <ArchetypeFoot
            openView={openView}
            content={content}
            onToggle={toggleView}
          />
        </div>
      )}
    </ModuleWrapper>
  );
};
