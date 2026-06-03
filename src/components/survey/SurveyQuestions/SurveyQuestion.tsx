import { Button, ButtonSelect } from "@gi/athena";
import { i18n, type MessageDescriptor } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { motion } from "framer-motion";
import React, { type ReactNode, useMemo, useState } from "react";
import {
  EXPLANATION_PREVIEW_FALLBACK_CHARS,
  EXPLANATION_TRIGGER_PHRASES,
  getUnderscoredPhrases,
} from "./SurveyQuestion.constants";
import { type SurveyQuestionProps } from "./SurveyQuestion.types";

export function renderWithUnderscores(text: string): ReactNode[] {
  const phrases = getUnderscoredPhrases();
  if (phrases.length === 0) return [text];

  const escaped = phrases.map((p: string) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const regex = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    phrases.includes(part) ? (
      <span
        key={`underscored-${i}`}
        className="underline decoration-2 font-semibold"
      >
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function getDescriptionPreview(description: string): string {
  const lower = description.toLowerCase();

  for (const phrase of EXPLANATION_TRIGGER_PHRASES) {
    const index = lower.indexOf(phrase.toLowerCase());
    if (index !== -1) {
      const cutoff = index + phrase.length;
      return `${description.substring(0, cutoff).trim()}...`;
    }
  }

  if (description.length < EXPLANATION_PREVIEW_FALLBACK_CHARS)
    return description.trim();
  return `${description.substring(0, EXPLANATION_PREVIEW_FALLBACK_CHARS).trim()}...`;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}

interface DescriptionPanelProps {
  description: string;
  preview: string;
}

function DescriptionPanel({ description, preview }: DescriptionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-[calc(100%-2.5rem)] mx-auto mt-[-32px] z-0 overflow-hidden rounded-b-3xl shadow-xl border border-teal-900/40 border-t-0 bg-teal-950">
      <div className="w-full flex items-start justify-between gap-4 px-5 pb-5 pt-7">
        <div className="flex-1 text-sm leading-relaxed text-teal-50/90 pl-1 min-w-0">
          <p
            className="line-clamp-1 text-ellipsis italic"
            aria-hidden={isOpen}
            style={{ display: isOpen ? "none" : undefined }}
          >
            {preview}
          </p>
          <p
            className="whitespace-pre-wrap text-white font-normal"
            data-testid="explanation-content"
            aria-hidden={!isOpen}
            style={{ display: isOpen ? undefined : "none" }}
          >
            {description}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? t`Zwiń wyjaśnienie` : t`Rozwiń wyjaśnienie`}
          aria-expanded={isOpen}
          data-testid="explanation-toggle"
        >
          <ChevronIcon open={isOpen} />
        </Button>
      </div>
    </div>
  );
}

export const SurveyQuestion: React.FC<SurveyQuestionProps> = ({
  question,
  questionDescription,
  options = [],
  selectedOptionId,
  onSelectedOptionIdChange,
}) => {
  useLingui();

  const finalizedQuestion = useMemo(
    () => (typeof question === "string" ? question : i18n._(question)),
    [question],
  );

  const finalizedDescription = useMemo<string | undefined>(() => {
    if (!questionDescription) return undefined;
    return typeof questionDescription === "string"
      ? questionDescription
      : i18n._(questionDescription);
  }, [questionDescription]);

  const preview = useMemo(
    () =>
      finalizedDescription ? getDescriptionPreview(finalizedDescription) : null,
    [finalizedDescription],
  );

  return (
    <div
      className="flex flex-col w-full max-w-2xl gap-4"
      data-testid="survey-question"
    >
      <div className="rounded-3xl p-6 shadow-xl border border-teal-800/20 z-10 relative bg-teal-900">
        <p
          className="text-white text-xl font-bold leading-snug"
          data-testid="question-text"
        >
          {renderWithUnderscores(finalizedQuestion)}
        </p>
      </div>

      {finalizedDescription && preview && (
        <DescriptionPanel
          description={finalizedDescription}
          preview={preview}
        />
      )}

      <div className="mt-2 flex flex-col gap-2" data-testid="answer-selector">
        <span className="text-sm font-medium text-teal-900">
          {t`Wybierz odpowiedź`}:
        </span>
        <ButtonSelect
          options={options}
          selectedOptionId={selectedOptionId ?? ""}
          onSelectedOptionIdChange={onSelectedOptionIdChange}
          isFullWidth={true}
        />
      </div>
    </div>
  );
};
