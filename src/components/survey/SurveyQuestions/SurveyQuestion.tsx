import { Button, ButtonSelect } from "@gi/athena";
import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import React, { type ReactNode, useMemo, useState, useRef, useEffect } from "react";
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
  const regex = new RegExp(`(?<![\\wąćęłńóśźż])(${escaped.join("|")})(?![\\wąćęłńóśźż])`, "gi");
  const parts: Array<{ text: string; matched: boolean }> = [];
  let lastIndex = 0;
  for (const match of text.matchAll(regex)) {
    if (match.index! > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), matched: false });
    }
    parts.push({ text: match[0], matched: true });
    lastIndex = match.index! + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), matched: false });
  }

  return parts.map(({ text: part, matched }, i) =>
    matched ? (
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


interface DescriptionPanelProps {
  description: string;
  preview: string;
}

function DescriptionPanel({ description, preview }: DescriptionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPermanentlyExpanded, setIsPermanentlyExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const previewEl =
      contentRef.current.querySelector<HTMLElement>(".preview-text");
    const fullEl = contentRef.current.querySelector<HTMLElement>(".full-text");

    if (previewEl) setCollapsedHeight(previewEl.scrollHeight + 28);
    if (fullEl) setExpandedHeight(fullEl.scrollHeight + 28);
  }, [preview, description]);

  const handleToggle = () => {
    if (!isPermanentlyExpanded) {
      setIsOpen(true);
      setIsPermanentlyExpanded(true);
    }
  };

  const currentHeight = isOpen
    ? (expandedHeight ?? "auto")
    : (collapsedHeight ?? "auto");

  return (
    <div
      className="w-[90%] mx-auto mt-[-20px] pt-4 z-0 rounded-b-2xl shadow-md border border-t-0 overflow-hidden bg-[var(--color-gi-primary)]"
      style={{
        borderColor: "color-mix(in srgb, var(--color-gi-secondary) 30%, transparent)",
      }}
    >
      <div
        className="overflow-hidden"
        style={{
          height: typeof currentHeight === "number" ? `${currentHeight}px` : currentHeight,
          transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="px-4 pt-3 pb-4" ref={contentRef}>
          <div
            className="preview-text flex items-center gap-2"
            style={{
              opacity: isOpen ? 0 : 1,
              position: isOpen ? "absolute" : "relative",
              pointerEvents: isOpen ? "none" : "auto",
              transition: isOpen
                ? "opacity 200ms ease"
                : "opacity 200ms ease 200ms",
            }}
          >
            <span
              className="flex-1 min-w-0 text-xs leading-normal font-medium truncate"
              style={{
                color:
                  "color-mix(in srgb, var(--color-gi-dark-ash) 75%, transparent)",
              }}
            >
              {preview}
            </span>
            {!isPermanentlyExpanded && (
              <button
                className="shrink-0 flex items-center justify-center appearance-none"
                style={{
                  width: "36px",
                  height: "28px",
                  backgroundColor: "transparent",
                  background: "none",
                  border: "none",
                  boxShadow: "none",
                  cursor: "pointer",
                  color: "color-mix(in srgb, var(--color-gi-dark-ash) 75%, transparent)",
                  padding: 0,
                }}
                onClick={handleToggle}
                aria-label={t`Rozwiń wyjaśnienie`}
                aria-expanded={isOpen}
                data-testid="explanation-toggle"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>

          <div
            data-testid="explanation-content"
            className="full-text text-xs leading-relaxed font-normal whitespace-pre-wrap text-white"
            style={{
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
              padding: isOpen ? "8px" : "0",
              transition: isOpen
                ? "opacity 200ms ease 200ms"
                : "opacity 200ms ease",
            }}
          >
            {description}
          </div>
        </div>
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
      className="flex flex-col w-full max-w-2xl"
      data-testid="survey-question"
    >
      <div
        className="rounded-3xl px-4 py-8 shadow-xl border z-10 relative flex items-center"
        style={{
          backgroundColor: "var(--color-gi-light-primary)",
          borderColor:
            "color-mix(in srgb, var(--color-gi-secondary) 25%, transparent)",
        }}
      >
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

      <div
        className="flex flex-col gap-2"
        style={{ marginTop: finalizedDescription && preview ? "16px" : "16px" }}
        data-testid="answer-selector"
      >
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