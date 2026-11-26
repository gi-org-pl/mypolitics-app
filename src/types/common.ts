// What ties a tab panel to its tab: its own identifier, and the identifier of
// the tab that names it.
export interface TabPanelIdentity {
  id: string;
  labelledBy: string;
}
