import { useState } from "react";

import type { SurveySession } from "@/types/survey";

import type {
  ChangeDirection,
  ContentChange,
} from "../../SurveyQuestionnaire.types";
import { getChangeDirection } from "./getChangeDirection";
import { getContentKey } from "./getContentKey";

interface ShownContent {
  session: SurveySession;
  direction?: ChangeDirection;
}

// The content on screen and the way it arrived. The direction is worked out
// once, in the render that shows the new content, against the session whose
// content was on screen before.
export const useContentChange = (session: SurveySession): ContentChange => {
  const [shown, setShown] = useState<ShownContent>({ session });
  const contentKey = getContentKey(session);

  if (getContentKey(shown.session) === contentKey) {
    return { contentKey, direction: shown.direction };
  }

  const direction = getChangeDirection(shown.session, session);

  setShown({ session, direction });

  return { contentKey, direction };
};
