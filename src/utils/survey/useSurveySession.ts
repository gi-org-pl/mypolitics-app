import { useMemo } from "react";
import { useStore } from "zustand";

import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import type {
  Survey,
  SurveySessionActions,
  SurveySessionApi,
} from "@/types/survey";
import { getSafeSessionStorage } from "@/utils/storage/getSafeSessionStorage";

import { answerQuestion } from "./answerQuestion";
import { bindSessionAction } from "./bindSessionAction";
import { closeSessionCheckpoint } from "./closeSessionCheckpoint";
import { confirmSessionCategories } from "./confirmSessionCategories";
import { createSession } from "./createSession";
import { fitSession } from "./fitSession";
import { getSessionStorageKey } from "./getSessionStorageKey";
import { getSurveySessionStore } from "./getSurveySessionStore";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { leaveSessionEmailCapture } from "./leaveSessionEmailCapture";
import { resetSession } from "./resetSession";
import { setSessionCategories } from "./setSessionCategories";
import { setSessionDemographics } from "./setSessionDemographics";
import { setSessionEmail } from "./setSessionEmail";
import { setSessionResultState } from "./setSessionResultState";
import { showSessionCheckpoint } from "./showSessionCheckpoint";
import { skipQuestion } from "./skipQuestion";
import { skipSessionCategories } from "./skipSessionCategories";
import { stepBack } from "./stepBack";
import { turnSessionCheckpointsOff } from "./turnSessionCheckpointsOff";

// The React side of the session's Zustand store.
//
// The session of a quiz lives in a Zustand store - `getSurveySessionStore`:
// one vanilla store per quiz identifier, with the `persist` middleware writing
// every change to the storage of the tab. Nothing of the session is kept in
// React state or in a context. This hook subscribes a component to that store
// and hands out the session with its actions.
//
// The actions are not kept in the store. Each is a pure function
// `(survey, session, ...arguments) => session` in a file of its own, and
// `bindSessionAction` applies it to what the store holds at that moment and
// writes the result back. An action needs the quiz as it is read now, and the
// store outlives a reading: the same quiz read again in another language
// keeps its session. So the store holds, and stores, the session and nothing
// else, and the actions are bound here, to the quiz the hook was handed.
//
// The session handed out is the one of the store as it fits the quiz as read
// now: when a reading has other questions than the one before, the entries
// that no longer fit are left out, by the rules of a restore. The actions stay
// the same functions for as long as the quiz object does.
export const useSurveySession = (survey: Survey): SurveySessionApi => {
  // The Zustand store of this quiz, and a subscription to the whole session.
  const store = getSurveySessionStore(survey);
  const storedSession = useStore(store);
  const session = useMemo(
    () => fitSession(survey, storedSession, SURVEY_SESSION_CONFIG),
    [survey, storedSession],
  );
  const actions = useMemo<SurveySessionActions>(
    () => ({
      setCategories: bindSessionAction(store, survey, setSessionCategories),
      confirmCategories: bindSessionAction(
        store,
        survey,
        confirmSessionCategories,
      ),
      skipCategories: bindSessionAction(store, survey, skipSessionCategories),
      answer: bindSessionAction(store, survey, answerQuestion),
      skip: bindSessionAction(store, survey, skipQuestion),
      back: bindSessionAction(store, survey, stepBack),
      showCheckpoint: bindSessionAction(store, survey, showSessionCheckpoint),
      closeCheckpoint: bindSessionAction(store, survey, closeSessionCheckpoint),
      turnCheckpointsOff: bindSessionAction(
        store,
        survey,
        turnSessionCheckpointsOff,
      ),
      setDemographics: bindSessionAction(store, survey, setSessionDemographics),
      leaveDemographics: bindSessionAction(
        store,
        survey,
        leaveSessionDemographics,
      ),
      setEmail: bindSessionAction(store, survey, setSessionEmail),
      leaveEmailCapture: bindSessionAction(
        store,
        survey,
        leaveSessionEmailCapture,
      ),
      setResultState: bindSessionAction(store, survey, setSessionResultState),
      reset: bindSessionAction(store, survey, resetSession),
      // Only the record goes. The session in memory stays, so the screen keeps
      // showing what it showed until the browser has navigated away.
      leave: () =>
        getSafeSessionStorage()?.removeItem(getSessionStorageKey(survey.id)),
      // Nothing is carried over, the checkpoint opt-out included.
      startOver: () => store.setState(createSession(survey), true),
    }),
    [store, survey],
  );

  return useMemo(() => ({ session, ...actions }), [session, actions]);
};
