import type { ReactNode } from "react";

import type { ResultsTab } from "../../../ResultsHeader/ResultsHeader.types";

export interface ResultsPanelProps {
  tab: ResultsTab; // the tab whose content this is
  isActive: boolean;
  hasTabs: boolean; // false: nothing switches the content, so it is no tab panel
  children: ReactNode;
}
