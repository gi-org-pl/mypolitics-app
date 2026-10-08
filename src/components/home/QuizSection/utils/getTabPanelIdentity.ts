import type { QuizTab, TabPanelIdentity } from "../QuizSection.types";

// Athena's Tabs gives every tab the id "tab-<value>" and points it at
// "panel-<value>": the panel of the active tab takes exactly these.
export const getTabPanelIdentity = (tab: QuizTab): TabPanelIdentity => ({
  id: `panel-${tab}`,
  labelledBy: `tab-${tab}`,
});
