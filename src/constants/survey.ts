// The API has no slugs, so the map is kept by hand: one entry per quiz that
// has a project in this API, from its slug to the identifier of the project.
// The slugs are predefined here until the API has them. The survey to read
// is the one the project names as its latest (`getLatestSurvey`), so a new
// version of a quiz needs no change here.
export const QUIZ_PROJECT_IDS: Record<string, string> = {
  mypolitics: "5ab50822-e95e-4c7c-a1d6-14aceb68f108",
  prezydencki2025: "69ef6c38-7292-4096-a9ef-a58e682dbfde",
};

export const RESULTS_URL = "https://mypolitics.pl/results";
