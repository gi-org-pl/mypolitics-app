import { useLingui } from "@lingui/react";
import { useId, useState } from "react";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";

import {
  EXPLANATION_FALLBACK,
  EXPLANATION_TRIGGER_PHRASES,
} from "../SurveyQuestion.constants";
import type { SurveyQuestionExplanationProps } from "./SurveyQuestionExplanation.types";
import { getExplanationPreview } from "./utils/getExplanationPreview";

export const SurveyQuestionExplanation = ({
  explanation,
}: SurveyQuestionExplanationProps) => {
  const { i18n } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const preview =
    getExplanationPreview(
      explanation,
      EXPLANATION_TRIGGER_PHRASES.map((phrase) => i18n._(phrase)),
    ) ?? i18n._(EXPLANATION_FALLBACK);

  return (
    <div className="w-full px-6">
      <div
        className={`relative grid rounded-b-2xl bg-gi-primary transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? "grid-rows-[auto_1fr]" : "grid-rows-[auto_0fr]"
        }`}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="col-start-1 row-start-1 min-w-0 cursor-pointer px-3 py-2 text-left outline-none after:absolute after:inset-0 after:rounded-b-2xl after:content-[''] focus-visible:after:ring-[3px] focus-visible:after:ring-white/75 focus-visible:after:ring-inset"
          onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        >
          <span
            className={`flex h-3.5 items-center justify-between gap-1 transition-opacity duration-300 motion-reduce:transition-none ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="min-w-0 truncate text-sm leading-[17px] font-bold text-white/75">
              {preview}
            </span>
            <span
              aria-hidden="true"
              className="h-[7px] w-3 shrink-0 bg-white/75"
              style={{
                mask: `url("${chevronDownIcon}") center / contain no-repeat`,
              }}
            />
          </span>
        </button>
        <div
          id={panelId}
          aria-hidden={!isOpen}
          className={`col-start-1 row-span-2 row-start-1 min-h-0 overflow-hidden rounded-b-2xl transition-[opacity,visibility] duration-300 motion-reduce:transition-none ${
            isOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <p className="p-2 text-left text-sm leading-[17px] font-semibold wrap-break-word text-white">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
