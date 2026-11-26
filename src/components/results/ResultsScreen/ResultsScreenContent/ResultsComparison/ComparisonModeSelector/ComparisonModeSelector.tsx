import { useLingui } from "@lingui/react/macro";

import { PillTabs } from "@/components/results/PillTabs/PillTabs";
import { ComparisonMode } from "@/types/comparison";
import { getTabPanelIdentity } from "@/utils/dom/getTabPanelIdentity";
import {
  COMPARISON_MODE_LABELS,
  COMPARISON_MODES,
} from "./ComparisonModeSelector.constants";
import type { ComparisonModeSelectorProps } from "./ComparisonModeSelector.types";
import { FriendForm } from "./FriendForm/FriendForm";
import { OrientationList } from "./OrientationList/OrientationList";
import { getFriendNotice } from "./utils/getFriendNotice";

// What the comparison tab shows while no comparison runs: the choice of who
// to compare with. Two modes as a tab list, the friend first, and under them
// what the chosen mode needs - the form of a friend, or the list of the
// orientations of the quiz.
//
// A quiz that offers no orientation has one mode: the form of a friend
// stands alone, with no tab list over it and as no tab panel.
export const ComparisonModeSelector = ({
  state,
  resultId,
  orientations,
  onModeChange,
  onFriendIdChange,
  onOrientationPick,
}: ComparisonModeSelectorProps) => {
  const { i18n, t } = useLingui();
  const hasModes = orientations.length > 0;
  const { id, labelledBy } = getTabPanelIdentity(state.mode);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {hasModes && (
        <PillTabs
          label={t`Tryb porównania`}
          tabs={COMPARISON_MODES.map((value) => ({
            value,
            label: i18n._(COMPARISON_MODE_LABELS[value]),
          }))}
          value={state.mode}
          onChange={onModeChange}
        />
      )}
      <div
        role={hasModes ? "tabpanel" : undefined}
        id={hasModes ? id : undefined}
        aria-labelledby={hasModes ? labelledBy : undefined}
        className="min-w-0"
      >
        {hasModes && state.mode === ComparisonMode.Orientation ? (
          <OrientationList
            orientations={orientations}
            onPick={onOrientationPick}
          />
        ) : (
          <FriendForm
            resultId={resultId}
            friendId={state.friendId}
            notice={getFriendNotice(state)}
            onFriendIdChange={onFriendIdChange}
          />
        )}
      </div>
    </div>
  );
};
