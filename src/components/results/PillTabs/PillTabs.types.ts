export interface PillTab<Value extends string = string> {
  // What the tab stands for. It is also what tells the tab from every other
  // tab of the page: Athena's Tabs names a tab "tab-<value>" and points it at
  // "panel-<value>", so no two tabs of one page share a value.
  value: Value;
  label: string; // passed translated
}

export interface PillTabsProps<Value extends string = string> {
  label: string; // the name of the tab list. Passed translated
  tabs: PillTab<Value>[];
  value: Value; // the tab that is chosen
  onChange: (value: Value) => void;
}
