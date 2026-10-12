import { CATEGORY_IDS, surveyFixture } from "./survey.fixture";

// The quiz of `survey.fixture.ts` with one visible category left: ecology is
// hidden here as well. A quiz with fewer than two visible categories has no
// category select, so its session starts on the first question.
export const singleCategorySurveyFixture = {
  ...surveyFixture,
  categories: surveyFixture.categories.map((category) =>
    category.id === CATEGORY_IDS.ecology
      ? {
          ...category,
          name: JSON.stringify({ name: "Ekologia", isHidden: true }),
        }
      : category,
  ),
};
