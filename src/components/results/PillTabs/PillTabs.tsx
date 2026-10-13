import { Tabs } from "@gi-org-pl/athena";

import { PILL_TABS_CLASS_NAME } from "./PillTabs.constants";
import type { PillTabsProps } from "./PillTabs.types";
import { toTabValue } from "./utils/toTabValue";

// A choice between a few things of one kind, drawn as pills that share the
// row: the modes of a comparison, the views of a running one. It is a tab
// list, with the roles and the keys of Athena's Tabs; the panel of the chosen
// tab is drawn by whoever draws the list, and takes its identity from the
// value of the tab (`getTabPanelIdentity`).
export const PillTabs = <Value extends string>({
  label,
  tabs,
  value,
  onChange,
}: PillTabsProps<Value>) => (
  <Tabs
    isFullWidth
    aria-label={label}
    value={value}
    onValueChange={(chosen) => onChange(toTabValue(tabs, chosen, value))}
    items={tabs}
    className={PILL_TABS_CLASS_NAME}
  />
);
