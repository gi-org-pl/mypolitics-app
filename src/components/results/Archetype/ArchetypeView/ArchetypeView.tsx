import type { RankedComparison } from "@/types/results";

import type {
  ArchetypeContent,
  ArchetypeView as OpenView,
} from "../Archetype.types";
import { ArchetypeDescription } from "./ArchetypeDescription/ArchetypeDescription";
import { ArchetypeRanking } from "./ArchetypeRanking/ArchetypeRanking";

interface ArchetypeViewProps {
  openView: OpenView;
  content: ArchetypeContent;
  comparison?: RankedComparison;
}

export const ArchetypeView = ({
  openView,
  content,
  comparison,
}: ArchetypeViewProps) => {
  const isRanking = openView === "ranking";
  const description =
    openView === "description"
      ? content.fullDescription
      : content.shortDescription;

  if (!isRanking && description === "") return null;

  return (
    <>
      <hr className="-mx-4 -mb-px border-gi-ash" />
      {isRanking ? (
        <ArchetypeRanking ranking={content.ranking} comparison={comparison} />
      ) : (
        <ArchetypeDescription text={description} />
      )}
    </>
  );
};
