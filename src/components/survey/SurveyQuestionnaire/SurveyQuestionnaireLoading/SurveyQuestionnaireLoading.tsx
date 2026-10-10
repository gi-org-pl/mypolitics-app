import { Trans } from "@lingui/react/macro";

import {
  ANSWER_PLACEHOLDERS,
  PLACEHOLDER_CLASS_NAME,
} from "./SurveyQuestionnaireLoading.constants";

// The quiz is on its way: still placeholders where the bar, the controls bar,
// the question card and the answers will stand. Nothing to read and nothing to
// press; assistive technology is told what is going on.
export const SurveyQuestionnaireLoading = () => (
  <div role="status" className="flex w-full flex-col gap-4">
    <span className="sr-only">
      <Trans>Wczytywanie quizu</Trans>
    </span>
    <div aria-hidden="true" className="flex w-full flex-col gap-4">
      <div className={`h-2 w-full rounded-full ${PLACEHOLDER_CLASS_NAME}`} />
      <div className="flex w-full items-center justify-between gap-2.5">
        <div className={`size-12 rounded-full ${PLACEHOLDER_CLASS_NAME}`} />
        <div
          className={`h-12 w-36 min-w-0 rounded-full ${PLACEHOLDER_CLASS_NAME}`}
        />
        <div className={`size-12 rounded-full ${PLACEHOLDER_CLASS_NAME}`} />
      </div>
      <div className={`h-26.5 w-full rounded-3xl ${PLACEHOLDER_CLASS_NAME}`} />
      <div className="flex w-full flex-col gap-2">
        {ANSWER_PLACEHOLDERS.map((placeholder) => (
          <div
            key={placeholder}
            className={`h-14 w-full rounded-3xl ${PLACEHOLDER_CLASS_NAME}`}
          />
        ))}
      </div>
    </div>
  </div>
);
