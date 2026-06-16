import { ButtonSelect } from "@gi/athena";
import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import React, {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MenuIcon from "../../../assets/vectors/description-button.svg";
import {
  EXPLANATION_PREVIEW_FALLBACK_CHARS,
  EXPLANATION_TRIGGER_PHRASES,
  getUnderscoredPhrases,
} from "./SurveyQuestion.constants";
import {
  type DescriptionPanelProps,
  type SurveyQuestionProps,
} from "./SurveyQuestion.types";

export function renderWithUnderscores(text: string): ReactNode[] {
  const phrases = getUnderscoredPhrases();
  if (phrases.length === 0) return [text];

  const escaped = phrases.map((p: string) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const regex = new RegExp(
    `(?<![\\wąćęłńóśźż])(${escaped.join("|")})(?![\\wąćęłńóśźż])`,
    "gi",
  );
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
  className="w-[90%] mx-auto -mt-7 pt-7 z-0 rounded-b-2xl shadow-md border border-t-0 bg-(--color-gi-primary)"
  style={{
    borderColor: "color-mix(in srgb, --color-gi-secondary 30%, transparent)",
  }}
>

  {!isOpen && !isPermanentlyExpanded && (
    <div className="flex items-center px-3 pt-[6.5px] pb-3">
      <span className="flex-1 min-w-0 text-[14px] font-Roboto font-bold leading-[120%] text-white truncate">
        {preview}
      </span>
      <button
        className="shrink-0 flex items-center justify-center w-9 h-7 bg-transparent border-none p-0 cursor-pointer text-white appearance-none"
        onClick={handleToggle}
        aria-label={t`Rozwiń wyjaśnienie`}
        aria-expanded={isOpen}
        data-testid="explanation-toggle"
      >
        <img src={MenuIcon} alt="Menu" />
      </button>
    </div>
  )}


  <div
    className="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
    style={{
      height: isOpen
        ? typeof currentHeight === "number"
          ? `${currentHeight}px`
          : currentHeight
        : "0px",
    }}
  >
    <div className="px-3 py-[6.5px]" ref={contentRef}>
      <div
        data-testid="explanation-content"
        className="full-text text-xs leading-relaxed font-Roboto font-semibold whitespace-pre-wrap text-white"
        style={{
          opacity: isOpen ? 1 : 0,
          transition: isOpen
            ? "opacity 300ms ease 100ms"
            : "opacity 300ms ease",
          padding: isOpen ? "8px" : "0",
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

  const hasDescription = Boolean(finalizedDescription && preview);

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
          className="text-white text-{18px} font-Roboto font-bold "
          data-testid="question-text"
        >
          {renderWithUnderscores(finalizedQuestion)}
        </p>
      </div>

      {hasDescription && (
        <DescriptionPanel
          description={finalizedDescription!}
          preview={preview!}
        />
      )}

      <div className="flex flex-col gap-2 mt-4" data-testid="answer-selector">
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
