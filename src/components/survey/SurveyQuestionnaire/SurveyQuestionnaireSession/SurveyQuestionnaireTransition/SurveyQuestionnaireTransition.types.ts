import type { ReactNode, Ref } from "react";

import type { ChangeDirection } from "../SurveyQuestionnaireSession.types";

export interface SurveyQuestionnaireTransitionProps {
  contentKey: string;
  direction?: ChangeDirection;
  contentRef: Ref<HTMLDivElement>; // the top of the content, for the focus
  children: ReactNode;
}
