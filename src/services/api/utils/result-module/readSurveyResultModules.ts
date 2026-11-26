import type { ResultModule } from "@/types/results";

import { getOwnResultModules } from "./getOwnResultModules";
import { readResultModules } from "./readResultModules";

// The result modules of a quiz: the list the API sends, or the app's own list
// for that survey while the API's holds no record that can be placed. Both
// are read with `readResultModules`, so one set of rules serves them.
export const readSurveyResultModules = (
  response: unknown,
  survey: { id: string; language: string },
  known: Parameters<typeof readResultModules>[1],
): ResultModule[] => {
  const modules = readResultModules(response, known);

  return modules.length > 0
    ? modules
    : readResultModules(getOwnResultModules(survey.id, survey.language), known);
};
