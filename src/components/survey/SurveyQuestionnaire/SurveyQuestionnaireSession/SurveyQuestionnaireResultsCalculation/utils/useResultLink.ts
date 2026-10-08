import { useLingui } from "@lingui/react";
import { useEffect, useState } from "react";

import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import { requestResultLink } from "@/services/api/client/requestResultLink";
import type { SurveySessionApi } from "@/types/survey";
import { isOneOf } from "@/utils/array/isOneOf";

import { STORED_HAND_IN_STATES } from "../SurveyQuestionnaireResultsCalculation.constants";
import type {
  HandInState,
  ResultLinkState,
} from "../SurveyQuestionnaireResultsCalculation.types";
import { getResultLinkInput } from "./getResultLinkInput";

// Step 2: the link to the result is asked for once the result is stored -
// never before, so never for a result that does not exist - and only when the
// session holds an address and sending is set up.
//
// One session asks for one link at most, because a repeat after a lost reply
// would mail the link twice. The address is taken out of the session at the
// moment the request is made, which keeps that true through a retry and a
// remount: the request holds the only copy until it has answered. It is not
// cancelled when the phase is left - it may already have reached the
// endpoint - and its outcome is then simply not heard.
export const useResultLink = (
  { session, setEmail }: Pick<SurveySessionApi, "session" | "setEmail">,
  handIn: HandInState,
): ResultLinkState => {
  const { i18n } = useLingui();
  const [link, setLink] = useState<ResultLinkState>("none");
  const isStored = isOneOf(STORED_HAND_IN_STATES, handIn);

  useEffect(() => {
    const input = getResultLinkInput(session, i18n.locale);

    if (
      link !== "none" ||
      !isStored ||
      input === undefined ||
      !SURVEY_SESSION_CONFIG.isEmailSendingSetUp
    ) {
      return;
    }

    setLink("pending");
    setEmail(null);
    requestResultLink(input).then((outcome) =>
      setLink(outcome === "accepted" ? "accepted" : "not-sent"),
    );
  }, [link, isStored, session, i18n, setEmail]);

  return link;
};
