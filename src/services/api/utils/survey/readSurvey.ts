import {
  axisResponseSchema,
  categoryResponseSchema,
  questionResponseSchema,
  surveyResponseSchema,
} from "@/services/api/schemas/survey";
import { readQuizOrientations } from "@/services/api/utils/orientation/readQuizOrientations";
import type { SurveyLoadResult } from "@/types/survey";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { parseItems } from "@/utils/zod/parseItems";
import { trimmedTextSchema } from "@/utils/zod/trimmedTextSchema";

import { toSurveyAxis } from "./toSurveyAxis";
import { toSurveyCategory } from "./toSurveyCategory";
import { toSurveyQuestion } from "./toSurveyQuestion";

const OFFICIAL_SURVEY_TYPE = "OFFICIAL";

export const readSurvey = (
  response: unknown,
  surveyId: string,
): SurveyLoadResult => {
  const { success, data } = surveyResponseSchema.safeParse(response);

  if (!success) return { status: "failed" };

  const isOfficial = data.type === OFFICIAL_SURVEY_TYPE;
  const orientations = readQuizOrientations(data.orientations, {
    isOfficialQuiz: isOfficial,
  });
  const orientationIds = new Set(orientations.map(({ id }) => id));

  const categories = uniqueBy(
    parseItems(data.categories, categoryResponseSchema),
    ({ id }) => id,
  ).map(toSurveyCategory);
  const categoryIds = new Set(categories.map(({ id }) => id));

  const axes = uniqueBy(
    parseItems(data.axis, axisResponseSchema),
    ({ id }) => id,
  ).map((axis) => toSurveyAxis(axis, { orientationIds }));

  // A question is dropped before the duplicates are, so that the one kept is
  // the first that can be asked.
  const questions = uniqueBy(
    parseItems(data.questions, questionResponseSchema)
      .map((question) =>
        toSurveyQuestion(question, { categoryIds, orientationIds }),
      )
      .filter(({ possibleAnswers }) => possibleAnswers.length > 0),
    ({ id }) => id,
  );

  if (questions.length === 0) return { status: "not-found" };

  return {
    status: "ready",
    survey: {
      id: surveyId,
      name: data.title,
      isOfficial,
      averageFinishTime: data.averageFinishTime,
      algorithm: data.algorithm,
      defaultLanguage: data.defaultLanguage,
      supportedLanguages: parseItems(
        data.supportedLanguages,
        trimmedTextSchema,
      ),
      orientations,
      categories,
      axes,
      questions,
    },
  };
};
