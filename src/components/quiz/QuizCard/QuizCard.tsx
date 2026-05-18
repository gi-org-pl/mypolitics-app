import type { MessageDescriptor } from "@lingui/core";
import { Trans, useLingui } from "@lingui/react";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import chevronIconUrl from "@/assets/icons/fa-solid_chevron-down.svg";
import playIconUrl from "@/assets/icons/fa-solid_play.svg";
import playIconDarkUrl from "@/assets/icons/fa-solid_play-dark.svg";
import { useMinWidthMd } from "@/utils/useMinWidthMd";

import type { QuizCardProps } from "./QuizCard.types";

const HERO_IMAGE_HEIGHT_PX = 102;

const quizCardMessages = {
  startQuiz: { id: "Rozpocznij quiz", message: "Rozpocznij quiz" },
  start: { id: "Rozpocznij", message: "Rozpocznij" },
  expand: { id: "Rozwiń", message: "Rozwiń" },
  collapse: { id: "Zwiń", message: "Zwiń" },
} as const satisfies Record<string, MessageDescriptor>;

function cn(...parts: Array<string | false | undefined>): string {
  return twMerge(parts.filter(Boolean).join(" "));
}

const playButtonFocusClass =
  "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-secondary";

const playButtonSharedClass =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full";

const playButtonPrimaryClass = cn(
  playButtonSharedClass,
  "border-0 bg-gi-primary text-white hover:bg-gi-primary-hover",
  playButtonFocusClass,
);

const playButtonSecondaryClass = cn(
  playButtonSharedClass,
  "border border-gi-primary bg-gi-primary/10 text-gi-primary hover:bg-gi-primary/20",
  playButtonFocusClass,
);

const playStartLabelTypographyClass =
  "text-[16px] font-bold leading-[100%] text-current";

const playIconSlotClass =
  "pointer-events-none inline-flex size-4 shrink-0 items-center justify-center";

export function QuizCard({
  title,
  logoUrl,
  logoHeight = 32,
  backgroundUrl,
  cta,
  description,
  tags,
  isHighlighted = false,
  isShowStartText = false,
  isMainAction = false,
  isButtonLoading = false,
  isButtonDisabled = false,
  isAlwaysExpanded = false,
  onButtonClick,
  onCardClick,
}: QuizCardProps): ReactElement {
  const { i18n } = useLingui();
  const [isExpandedValue, setIsExpandedValue] = useState(false);
  const isMdUp = useMinWidthMd();
  const logoAlt = title?.trim() ?? "";
  const hasHeroImage = Boolean(backgroundUrl);
  const isLayoutAlwaysExpanded = isAlwaysExpanded || hasHeroImage;

  const isContentExpanded =
    isLayoutAlwaysExpanded || isHighlighted || isMdUp || isExpandedValue;

  const showExpandChrome = !isHighlighted && !isLayoutAlwaysExpanded && !isMdUp;

  const handleCardClick = (): void => {
    onCardClick?.();
  };

  const shell = cn(
    "w-full overflow-hidden rounded-[24px] border p-0",
    onCardClick && "cursor-pointer",
    "border-gi-dark-ash",
    "bg-gi-ash",
    "text-gi-primary",
    isHighlighted && "md:rounded-[32px]",
  );

  const titleClass =
    "m-0 min-w-0 text-left text-2xl font-bold leading-[120%] text-gi-light-primary";

  const descExpandedClass =
    "m-0 text-left align-middle text-[16px] font-normal leading-[140%] text-gi-primary";

  const renderDescription = (bodyClass: string): ReactNode =>
    typeof description === "string" ? (
      <p className={bodyClass}>{description}</p>
    ) : (
      <div className={cn(bodyClass, "[&_b]:font-bold [&_span]:font-normal")}>
        {description}
      </div>
    );

  const expandToggleClass = cn(
    "inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 ring-1 ring-inset ring-gi-primary md:hidden",
    "bg-gi-ash",
    "hover:bg-gi-dark-ash/20",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-secondary",
  );

  const chevronIconClass = "pointer-events-none h-4 w-4 shrink-0";

  const playButtonBaseClass = isMainAction
    ? playButtonPrimaryClass
    : playButtonSecondaryClass;

  const playButtonClassName = cn(
    playButtonBaseClass,
    isShowStartText
      ? "w-auto min-h-12 gap-[12px] p-[16px] items-center justify-center text-center"
      : "size-12",
  );

  const playSpinnerSizeClass = isShowStartText ? "size-5" : "size-4";

  const tagChipClass = cn(
    "inline-flex items-center justify-center rounded-full border border-gi-primary/10 p-[12px]",
    "align-middle text-[16px] font-bold not-italic leading-[100%] text-gi-primary",
  );

  const expandedBody = (
    <div className="flex flex-col gap-2 overflow-hidden pt-2">
      <div className="min-w-0">{renderDescription(descExpandedClass)}</div>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className={tagChipClass}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );

  const ctaPaddingClass = backgroundUrl
    ? "px-[12px] py-[8px]"
    : "px-[16px] py-[12px]";

  const ctaBadgeInnerClass = cn(
    "bg-gi-primary text-left text-[14px] font-[700] leading-[120%] text-white",
    "rounded-br-2xl",
    ctaPaddingClass,
  );

  const ctaStrip = cta ? (
    <div className={cn("flex w-full", "bg-gi-ash")}>
      <div className={ctaBadgeInnerClass}>{cta}</div>
    </div>
  ) : null;

  const mainBlock = (
    <div className={cn("p-4", "bg-gi-ash", isHighlighted && "md:p-6")}>
      <div className="flex flex-col">
        <div className="flex h-12 min-h-12 items-center gap-2">
          <div className="flex min-h-0 min-w-0 flex-1 items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoAlt}
                height={logoHeight}
                className="h-auto w-auto max-w-[200px] object-contain"
                style={{ height: logoHeight, width: "auto" }}
              />
            ) : title?.trim() ? (
              <h2 className={titleClass}>{title.trim()}</h2>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {showExpandChrome ? (
              <button
                type="button"
                className={expandToggleClass}
                aria-expanded={isContentExpanded}
                aria-label={i18n._(
                  isContentExpanded
                    ? quizCardMessages.collapse
                    : quizCardMessages.expand,
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpandedValue((v) => !v);
                }}
              >
                <img
                  src={chevronIconUrl}
                  alt=""
                  width={16}
                  height={16}
                  className={cn(
                    chevronIconClass,
                    isContentExpanded && "rotate-180",
                  )}
                />
              </button>
            ) : null}

            {!isButtonDisabled ? (
              <button
                type="button"
                aria-busy={isButtonLoading ? true : undefined}
                className={playButtonClassName}
                aria-label={i18n._(quizCardMessages.startQuiz)}
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick();
                }}
              >
                {isShowStartText ? (
                  <span className={playStartLabelTypographyClass}>
                    <Trans
                      id={quizCardMessages.start.id}
                      message={quizCardMessages.start.message}
                    />
                  </span>
                ) : null}
                {isButtonLoading ? (
                  <span
                    className={cn(
                      "inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none",
                      playSpinnerSizeClass,
                    )}
                    aria-hidden
                  />
                ) : (
                  <span className={playIconSlotClass} aria-hidden>
                    {isMainAction ? (
                      <img
                        src={playIconUrl}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4"
                      />
                    ) : (
                      <img
                        src={playIconDarkUrl}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4"
                      />
                    )}
                  </span>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {isLayoutAlwaysExpanded ? (
          expandedBody
        ) : (
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
              isContentExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
            aria-hidden={!isContentExpanded ? true : undefined}
          >
            <div className="min-h-0 overflow-hidden">
              <div inert={!isContentExpanded ? true : undefined}>
                {expandedBody}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <article
      className={shell}
      onClick={onCardClick ? handleCardClick : undefined}
    >
      {isHighlighted && cta && !backgroundUrl ? ctaStrip : null}

      {backgroundUrl ? (
        <div
          className={cn("relative w-full overflow-hidden", "bg-gi-ash")}
          style={{
            height: isHighlighted && backgroundUrl ? 200 : HERO_IMAGE_HEIGHT_PX,
          }}
        >
          <img
            src={backgroundUrl}
            alt={logoAlt}
            className="absolute inset-0 size-full object-cover"
            decoding="async"
          />
        </div>
      ) : null}

      {cta && backgroundUrl ? ctaStrip : null}

      {cta && !backgroundUrl && !isHighlighted ? ctaStrip : null}

      {mainBlock}
    </article>
  );
}
