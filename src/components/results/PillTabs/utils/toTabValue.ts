import type { PillTab } from "../PillTabs.types";

// The value of the tab a tab list reports as chosen, as one of the values of
// its tabs. Athena's Tabs reports a plain text; a text that is the value of
// none of the tabs is no choice, so the tab that was chosen stays chosen.
export const toTabValue = <Value extends string>(
  tabs: readonly PillTab<Value>[],
  chosen: string,
  current: Value,
): Value => tabs.find(({ value }) => value === chosen)?.value ?? current;
