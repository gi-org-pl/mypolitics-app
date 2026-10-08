import type { Survey, SurveySession } from "@/types/survey";
import { createSession } from "@/utils/survey/createSession";
import { skipQuestion } from "@/utils/survey/skipQuestion";
import { skipSessionTopics } from "@/utils/survey/skipSessionTopics";

// A session for tests, made by replaying events: category select is skipped,
// then the first `done` questions are. With every question done the session
// is on demographics.
export const createStartedSession = (survey: Survey, done = 0): SurveySession =>
  survey.questions
    .slice(0, done)
    .reduce(
      (session) => skipQuestion(survey, session),
      skipSessionTopics(survey, createSession(survey)),
    );
