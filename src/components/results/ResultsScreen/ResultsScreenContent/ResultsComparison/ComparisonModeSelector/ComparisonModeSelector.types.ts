import type { Orientation } from "@/types/orientation";

import type {
  ComparisonActions,
  ComparisonChoiceState,
} from "../ResultsComparison.types";

export interface ComparisonModeSelectorProps {
  state: ComparisonChoiceState; // choosing, fetching or refused
  resultId: string; // the identifier of the taker's own result
  orientations: Orientation[]; // the offered orientations, in the order of the quiz. None = the orientation mode is not offered
  orientationLabel?: string; // the quiz's own name of the orientation mode, as a quiz of candidates has. Absent or blank = the app's
  onModeChange: ComparisonActions["chooseMode"];
  onFriendIdChange: ComparisonActions["enterFriendId"];
  onOrientationPick: ComparisonActions["pickOrientation"];
}
