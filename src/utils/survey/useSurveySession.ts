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
import { confirmSessionTopics } from "./confirmSessionTopics";
import { createSession } from "./createSession";
import { fitSession } from "./fitSession";
import { getSessionStorageKey } from "./getSessionStorageKey";
import { getSurveySessionStore } from "./getSurveySessionStore";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { leaveSessionEmailCapture } from "./leaveSessionEmailCapture";
import { resetSession } from "./resetSession";
import { setSessionDemographics } from "./setSessionDemographics";
import { setSessionEmail } from "./setSessionEmail";
import { setSessionResultState } from "./setSessionResultState";
import { setSessionTopics } from "./setSessionTopics";
import { showSessionCheckpoint } from "./showSessionCheckpoint";
import { skipQuestion } from "./skipQuestion";
import { skipSessionTopics } from "./skipSessionTopics";
import { stepBack } from "./stepBack";
import { turnSessionCheckpointsOff } from "./turnSessionCheckpointsOff";

// The session of a quiz and its actions, bound to the quiz as it was handed
// in. The store is found by the quiz identifier, so the same quiz read again
// in another language keeps its session. The session handed out is the one of
// the store as it fits the quiz as read now: when a reading has other
// questions than the one before, the entries that no longer fit are left out,
// by the rules of a restore. The actions stay the same functions for as long
// as the quiz object does.
export const useSurveySession = (survey: Survey): SurveySessionApi => {
  const store = getSurveySessionStore(survey);
  const storedSession = useStore(store);
  const session = useMemo(
    () => fitSession(survey, storedSession, SURVEY_SESSION_CONFIG),
    [survey, storedSession],
  );
  const actions = useMemo<SurveySessionActions>(
    () => ({
      setTopics: bindSessionAction(store, survey, setSessionTopics),
      confirmTopics: bindSessionAction(store, survey, confirmSessionTopics),
      skipTopics: bindSessionAction(store, survey, skipSessionTopics),
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
