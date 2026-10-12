import { useEffect, useMemo, useRef } from "react";

import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import type { CheckpointShownCard } from "@/types/checkpoint";
import type { Survey, SurveySessionApi } from "@/types/survey";
import { getEnabledCheckpointTypes } from "@/utils/checkpoint/engine/getEnabledCheckpointTypes";
import { getSessionCheckpoint } from "@/utils/checkpoint/engine/getSessionCheckpoint";
import { getCurrentQuestion } from "@/utils/survey/questions/getCurrentQuestion";
import { fitSession } from "@/utils/survey/session/fitSession";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";

import { CHECKPOINT_CARDS } from "../../../SurveyQuestionnaire.constants";
import type { QuestionActions } from "../SurveyQuestionnaireQuestions.types";
import { useCheckpointAggregates } from "./useCheckpointAggregates";
import { useQuestionTimer } from "./useQuestionTimer";

// Answer and skip: the one place a done question is handled. Each passes the
// seconds the question was on screen, and then asks for a checkpoint card.
//
// An answer reports its press only when its acknowledgement has played, a
// third of a second later. A question that has left the screen by then - the
// taker moved on in the site, or another question took its place - records
// nothing: an answer that was not acknowledged was not given.
//
// The card is asked for here, in the handler and never in an effect, so one
// boundary is asked once: only when the event made a question done, and with
// the session as it stands right after - the session of the render that
// handled the press is one entry behind. A card that comes back is recorded
// as a shown card, which moves the session to the Checkpoints phase; with
// nothing back the next question is shown exactly as if checkpoints did not
// exist. Nobody is asked on the way back.
//
// The engine is handed the answer counts of the quiz as they are at that
// moment: nothing while they have not arrived, or when there is no source. A
// question never waits for them.
export const useQuestionActions = (
  survey: Survey,
  { session, answer, skip, showCheckpoint }: SurveySessionApi,
): QuestionActions => {
  const isOnScreen = useRef(false);
  const getSeconds = useQuestionTimer(
    survey,
    getCurrentQuestion(survey, session)?.id,
  );

  const getAggregates = useCheckpointAggregates(survey.id);

  useEffect(() => {
    isOnScreen.current = true;

    return () => {
      isOnScreen.current = false;
    };
  }, []);

  return useMemo(() => {
    const store = getSurveySessionStore(survey);
    const finishQuestion = (record: () => void) => {
      const sessionBefore = store.getState();

      record();

      const sessionAfter = store.getState();

      if (sessionAfter === sessionBefore) return;

      const card = getSessionCheckpoint(
        survey,
        fitSession(survey, sessionAfter, SURVEY_SESSION_CONFIG),
        getEnabledCheckpointTypes(CHECKPOINT_CARDS),
        getAggregates(),
      );

      if (card) {
        showCheckpoint({ card } satisfies CheckpointShownCard);
      }
    };

    return {
      answer: (answerId) => {
        if (isOnScreen.current) {
          finishQuestion(() => answer(answerId, getSeconds()));
        }
      },
      skip: () => finishQuestion(() => skip(getSeconds())),
    };
  }, [survey, answer, skip, showCheckpoint, getSeconds, getAggregates]);
};
