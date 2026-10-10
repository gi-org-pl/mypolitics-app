import type { ReactNode, Ref } from "react";

import type { ChangeDirection } from "../SurveyQuestionnaireSession.types";

export interface SurveyQuestionnaireTransitionProps {
  contentKey: string; // what is mounted: another key is another element
  direction?: ChangeDirection;
  durationMs: number; // how long the new content takes to arrive
  contentRef: Ref<HTMLDivElement>; // the top of the content, for the focus
  children: ReactNode;
}
