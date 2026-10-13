import { getTabPanelIdentity } from "@/utils/dom/getTabPanelIdentity";

import type { ResultsPanelProps } from "./ResultsPanel.types";

// The content of one tab of the header, with the space the sheet keeps around
// it: the design's 24 px from the width the two columns start at, less on a
// narrower sheet. It is the panel of its tab, named by it, and it stays in
// the page while the other tab is shown.
export const ResultsPanel = ({
  tab,
  isActive,
  hasTabs,
  children,
}: ResultsPanelProps) => {
  const { id, labelledBy } = getTabPanelIdentity(tab);

  return (
    <div
      role={hasTabs ? "tabpanel" : undefined}
      id={hasTabs ? id : undefined}
      aria-labelledby={hasTabs ? labelledBy : undefined}
      hidden={!isActive}
      className="p-4 @[44rem]:p-6"
    >
      {children}
    </div>
  );
};
