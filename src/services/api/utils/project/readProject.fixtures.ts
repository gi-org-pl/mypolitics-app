// Three projects as sent by GET https://api.mypolitics.pl/api/v1/project/{projectId}
// on 2026-10-10, cut down to the two fields that are read. Left out: `name`,
// `createdAt`, `totalSolvedSurveys`, `surveys` (the versions of the quiz),
// `defaultLanguage` and `supportedLanguages`.

// "myPolitics Quiz Tożsamościowy": one survey, which is the latest.
export const identityQuizProject = {
  id: "5ab50822-e95e-4c7c-a1d6-14aceb68f108",
  latestSurveyId: "60beb898-a4e4-4160-88c4-07a9931ab499",
};

// "myPolitics Quiz Prezydencki 2025": three surveys, the latest being the
// third version.
export const presidentialQuizProject = {
  id: "69ef6c38-7292-4096-a9ef-a58e682dbfde",
  latestSurveyId: "270f6c12-6551-4661-bfcf-52635a703928",
};

// "myPolitics Quiz Wyborczy 2023": it has a survey, and none is named as the
// latest - the project has nothing to take.
export const electionQuizProject = {
  id: "044a0a2b-8fce-4308-927e-7f4a4c29be84",
  latestSurveyId: null,
};
