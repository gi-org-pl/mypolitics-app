import type { AxisOrientation } from "@/components/shared/UniversalAxis/UniversalAxis.types";

import type { RankedComparison } from "../HorizontalBarChart/HorizontalBarChart.types";

export interface ArchetypeEntry {
  orientation: AxisOrientation;
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

export interface ArchetypeRanking {
  leader: ArchetypeEntry | null;
  rest: ArchetypeEntry[];
}
