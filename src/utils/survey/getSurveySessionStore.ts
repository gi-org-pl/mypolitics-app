import { createStore, type StoreApi } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  SURVEY_SESSION_CONFIG,
  SURVEY_SESSION_VERSION,
} from "@/constants/survey";
import type { Survey, SurveySession } from "@/types/survey";
import { parseJsonObject } from "@/utils/json/parseJsonObject";
import { getSafeSessionStorage } from "@/utils/storage/getSafeSessionStorage";

import { getSessionStorageKey } from "./getSessionStorageKey";
import { restoreSession } from "./restoreSession";

const stores = new Map<string, StoreApi<SurveySession>>();

// One store per quiz identifier, for as long as the page lives: a quiz read
// again in another language finds the session it had.
//
// The session is restored here, once, from the record of the quiz - and not by
// the middleware, which only writes: every change goes to the storage of the
// tab at once, without the e-mail and the result state. When the browser
// refuses storage the session lives in memory only.
export const getSurveySessionStore = (
  survey: Survey,
): StoreApi<SurveySession> => {
  const knownStore = stores.get(survey.id);

  if (knownStore) return knownStore;

  const name = getSessionStorageKey(survey.id);
  const storage = getSafeSessionStorage();
  const session = restoreSession(
    survey,
    parseJsonObject(storage?.getItem(name) ?? ""),
    SURVEY_SESSION_CONFIG,
  );
  const store = storage
    ? createStore<SurveySession>()(
        persist(() => session, {
          name,
          version: SURVEY_SESSION_VERSION,
          storage: createJSONStorage(() => storage),
          partialize: ({ email, resultState, ...storedSession }) =>
            storedSession,
          skipHydration: true,
        }),
      )
    : createStore<SurveySession>()(() => session);

  stores.set(survey.id, store);

  return store;
};
