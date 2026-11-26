import { useLingui } from "@lingui/react/macro";

import { PillTabs } from "@/components/results/PillTabs/PillTabs";
import { getTabPanelIdentity } from "@/utils/dom/getTabPanelIdentity";

import {
  COMPARISON_VIEW_CONTENT,
  COMPARISON_VIEW_LABELS,
} from "./ComparisonViews.constants";
import type { ComparisonViewsProps } from "./ComparisonViews.types";

// What a running comparison shows under the agreement bar: the view that is
// chosen, of the views this comparison has. A comparison with several views
// has a switch above it - a tab list - and a line that reaches both edges of
// the sheet under the switch, as the design draws it; a comparison with one
// view shows it with no switch, and one with none shows nothing.
//
// Only the chosen view is in the page: what a view keeps for itself - a
// search, an opened row - lasts while that view is shown.
export const ComparisonViews = ({
  comparison,
  onViewChange,
  ...taker
}: ComparisonViewsProps) => {
  const { i18n, t } = useLingui();
  const { views, view } = comparison;

  if (view === undefined) return null;

  const View = COMPARISON_VIEW_CONTENT[view];
  const hasSwitch = views.length > 1;
  const { id, labelledBy } = getTabPanelIdentity(view);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 @[44rem]:gap-6">
      {hasSwitch && (
        <>
          <PillTabs
            label={t`Widok porównania`}
            tabs={views.map((value) => ({
              value,
              label: i18n._(COMPARISON_VIEW_LABELS[value]),
            }))}
            value={view}
            onChange={onViewChange}
          />
          <div className="-mx-(--results-panel-padding) border-t border-gi-dark-ash" />
        </>
      )}
      <div
        role={hasSwitch ? "tabpanel" : undefined}
        id={hasSwitch ? id : undefined}
        aria-labelledby={hasSwitch ? labelledBy : undefined}
        className="min-w-0"
      >
        <View {...taker} comparison={comparison} />
      </div>
    </div>
  );
};
