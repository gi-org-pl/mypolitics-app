import personAvatar from "@/assets/icons/person-avatar.svg";
import { ComparisonMode, type FriendSide } from "@/types/comparison";
import type { SurveyResult } from "@/types/survey";
import { createPersonOrientation } from "@/utils/orientation/createPersonOrientation";

import { FRIEND_COLOR } from "../ResultsComparison.constants";

// A friend as the other side of a comparison: a person whose identifier is
// the identifier of their result. The app knows no name and no image of a
// friend, so every friend goes by the word it is given and is drawn with the
// default avatar.
export const toFriendSide = (
  result: SurveyResult,
  name: string,
): FriendSide => ({
  mode: ComparisonMode.Friend,
  orientation: {
    ...createPersonOrientation({
      resultId: result.id,
      name,
      color: FRIEND_COLOR,
    }),
    imageUrl: personAvatar,
  },
  result,
});
