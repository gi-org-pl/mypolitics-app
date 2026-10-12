import { createStore, type StoreApi } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";

import {
  SURVEY_SESSION_CONFIG,
  SURVEY_SESSION_VERSION,
} from "@/constants/survey";
import type {
  StoredSurveySession,
  Survey,
  SurveySession,
  SurveySessionStore,
} from "@/types/survey";
import { getSafeSessionStorage } from "@/utils/storage/getSafeSessionStorage";
import { toJsonStorage } from "@/utils/storage/toJsonStorage";

import { getSessionStorageKey } from "./getSessionStorageKey";
import { restoreSession } from "./restoreSession";

const stores = new Map<string, SurveySessionStore>();

// One store per quiz identifier, for as long as the page lives: a quiz read
// again in another language finds the session it had.
//
// The session is restored here, once, from the record of the quiz - and not by
// the middleware, which only writes: every change goes to the storage of the
// tab at once, without the e-mail and the result state. When the browser
// refuses storage, or a change cannot be written, the session lives in memory.
//
// The store holds the session as it was last written. It is not fitted again
// when the quiz is read again: `useSurveySession` does that for the quiz it is
// handed, and a caller that reads the store by itself uses `fitSession`.
//
// The store also says whether the session it started with was read from
// storage: `restoredSession` is that session, and is absent for a session
// created on this page. The identifier of a new session is random, so a
// session with the identifier of the record is the record.
export const getSurveySessionStore = (survey: Survey): SurveySessionStore => {
  const knownStore = stores.get(survey.id);

  if (knownStore) return knownStore;

  const name = getSessionStorageKey(survey.id);
  const textStorage = getSafeSessionStorage();
  const storage = textStorage
    ? toJsonStorage<StorageValue<StoredSurveySession>>(textStorage)
    : undefined;
  const stored = storage?.getItem(name);
  const session = restoreSession(survey, stored, SURVEY_SESSION_CONFIG);
  const sessionStore: StoreApi<SurveySession> = storage
    ? createStore<SurveySession>()(
        persist(() => session, {
          name,
          version: SURVEY_SESSION_VERSION,
          storage,
          partialize: ({ email, resultState, ...storedSession }) =>
            storedSession,
          skipHydration: true,
        }),
      )
    : createStore<SurveySession>()(() => session);
  const store: SurveySessionStore = Object.assign(sessionStore, {
    restoredSession: stored?.state?.id === session.id ? session : undefined,
  });

  stores.set(survey.id, store);

  return store;
};
