import type { TabPanelIdentity } from "@/types/common";

// Athena's Tabs gives every tab the id "tab-<value>" and points it at
// "panel-<value>": the panel of a tab takes exactly these.
export const getTabPanelIdentity = (tab: string): TabPanelIdentity => ({
  id: `panel-${tab}`,
  labelledBy: `tab-${tab}`,
});
