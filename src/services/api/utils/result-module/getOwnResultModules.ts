import { OWN_RESULT_MODULES } from "@/constants/result-modules";

import { toSingleLanguageModule } from "./toSingleLanguageModule";

// The list the app keeps for a survey, in one language, as the API would send
// it. Empty for a survey the app has no list for.
export const getOwnResultModules = (surveyId: string, language: string) =>
  Object.hasOwn(OWN_RESULT_MODULES, surveyId)
    ? OWN_RESULT_MODULES[surveyId].map((record) =>
        toSingleLanguageModule(record, language),
      )
    : [];
