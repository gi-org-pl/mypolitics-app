import { useEffect, useState } from "react";

import type { ArchetypeOpenableView, ArchetypeView } from "../Archetype.types";

interface ArchetypeViewAvailability {
  hasDescription: boolean;
  hasRanking: boolean;
}

interface ArchetypeViewState {
  openView: ArchetypeView;
  toggleView: (view: ArchetypeOpenableView) => void;
}

export const useArchetypeView = ({
  hasDescription,
  hasRanking,
}: ArchetypeViewAvailability): ArchetypeViewState => {
  const [view, setView] = useState<ArchetypeView>("summary");

  const isStale =
    (view === "description" && !hasDescription) ||
    (view === "ranking" && !hasRanking);
  const openView = isStale ? "summary" : view;

  useEffect(() => {
    if (isStale) setView("summary");
  }, [isStale]);

  return {
    openView,
    toggleView: (target) => setView(openView === target ? "summary" : target),
  };
};
