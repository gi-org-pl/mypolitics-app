import type { SurveyLoadStatus } from "@/types/survey";

// A project of the API groups the versions of one quiz - its surveys - and
// names the one that is taken now.
export interface Project {
  id: string; // the identifier the project was asked for by
  latestSurveyId?: string; // absent while the project has no survey to take
}

// Reading a project ends the three ways reading a quiz does, so it is told
// with the same statuses: what is not ready is passed on as it is when the
// quiz of a project is read.
export type ProjectLoadResult =
  | { status: typeof SurveyLoadStatus.Ready; project: Project }
  | { status: typeof SurveyLoadStatus.NotFound } // no such project
  | { status: typeof SurveyLoadStatus.Failed }; // no reply, a refusal, or a reply that is not a project
