import type { Orientation } from "@/types/orientation";
import type { RankedComparison } from "@/types/results";

export interface ArchetypeEntry {
  orientation: Orientation;
  match?: number;
  shortDescription?: string;
  fullDescription?: string;
}

export interface ArchetypeProps {
  title?: string;
  archetypes: ArchetypeEntry[];
  comparison?: RankedComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}

export type ArchetypeView = "summary" | "description" | "ranking";

export type ArchetypeOpenableView = Exclude<ArchetypeView, "summary">;

export interface ArchetypeRanking {
  leader: ArchetypeEntry | null;
  rest: ArchetypeEntry[];
}

export interface ArchetypeContent {
  isMatched: boolean;
  shortDescription: string;
  fullDescription: string;
  ranking: ArchetypeEntry[];
  hasDescription: boolean;
  hasRanking: boolean;
}
