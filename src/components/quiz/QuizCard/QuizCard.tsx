import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import chevronDownIconUrl from "@/assets/icons/chevron-down.svg";
import chevronUpIconUrl from "@/assets/icons/chevron-up.svg";
import playIconUrl from "@/assets/icons/play.svg";
import { useMinWidthMd } from "@/utils/useMinWidthMd";

import {
  quizCardDefaultBorderClass,
  quizCardDefaultSurfaceBgClass,
} from "./QuizCard.constants";
import type { QuizCardProps } from "./QuizCard.types";

const HERO_IMAGE_HEIGHT_PX = 102;

function cn(...parts: Array<string | false | undefined>): string {
  return twMerge(parts.filter(Boolean).join(" "));
}

const playButtonFocusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-secondary";

/** `isMainAction` — filled primary (Figma / design-system primary CTA). */
const playButtonPrimaryClass = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-0 bg-gi-primary text-white hover:bg-gi-primary-hover",
  playButtonFocusClass,
);

/** Default play control: ghost / icon ring (outline on ash card). */
const playButtonGhostDefaultClass = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-0 bg-transparent text-gi-primary ring-1 ring-inset ring-gi-primary hover:bg-gi-dark-ash/20",
  playButtonFocusClass,
);

/** Ghost on highlighted (teal) shell — light ring for contrast. */
const playButtonGhostHighlightedClass = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-0 bg-white/10 text-white ring-1 ring-inset ring-white/30 hover:bg-white/20",
  playButtonFocusClass,
);

/** Labeled play on default card when `isShowStartText` && !`isMainAction` — matches expand chevron (light surface + inset ring). */
const playButtonLabeledLightDefaultClass = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-0 ring-1 ring-inset ring-gi-primary",
  quizCardDefaultSurfaceBgClass,
  "text-gi-primary hover:bg-gi-dark-ash/20",
  playButtonFocusClass,
);

/** Start label — on `<span>` so `text-[16px]` is not dropped by `twMerge` vs `text-gi-primary` / `text-white` on the button. */
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
  const [isExpanded, setIsExpanded] = useState(false);
  const isMdUp = useMinWidthMd();
  const logoAlt = title?.trim() ?? "";

  /** Matches spec: image / highlighted / explicit always-expanded. */
  const effectiveAlwaysExpanded =
    isAlwaysExpanded || Boolean(backgroundUrl) || isHighlighted;

  /** Chevron only when the card can collapse on small screens; hidden from `md:` up via CSS. */
  const showExpandChrome = !effectiveAlwaysExpanded;

  const handleCardClick = (): void => {
    onCardClick?.();
  };

  const shell = cn(
    "w-full overflow-hidden rounded-[24px] border p-0",
    onCardClick && "cursor-pointer",
    isHighlighted
      ? "border-gi-primary bg-gi-primary text-white"
      : cn(
          quizCardDefaultBorderClass,
          quizCardDefaultSurfaceBgClass,
          "text-gi-primary",
        ),
  );

  const titleClass = cn(
    "m-0 min-w-0 text-left text-2xl font-bold leading-[120%]",
    isHighlighted ? "text-white" : "text-gi-light-primary",
  );

  const descExpandedClass = cn(
    "m-0 text-left align-middle text-[16px] font-normal leading-[140%]",
    isHighlighted ? "text-white/90" : "text-gi-primary",
  );

  const renderDescription = (bodyClass: string): ReactNode =>
    typeof description === "string" ? (
      <p className={bodyClass}>{description}</p>
    ) : (
      <div className={cn(bodyClass, "[&_b]:font-bold [&_span]:font-normal")}>
        {description}
      </div>
    );

  const expandToggleClass = cn(
    "inline-flex size-12 shrink-0 items-center justify-center rounded-full border-0 ring-1 ring-inset md:hidden",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-secondary",
    isHighlighted
      ? "ring-white/30 bg-white/10 text-white hover:bg-white/20"
      : cn(
          "ring-gi-primary",
          quizCardDefaultSurfaceBgClass,
          "hover:bg-gi-dark-ash/20",
        ),
  );

  const chevronIconClass = "pointer-events-none h-4 w-4 shrink-0";

  const playButtonBaseClass =
    isShowStartText && !isMainAction
      ? isHighlighted
        ? playButtonGhostHighlightedClass
        : playButtonLabeledLightDefaultClass
      : isMainAction
        ? playButtonPrimaryClass
        : isHighlighted
          ? playButtonGhostHighlightedClass
          : playButtonGhostDefaultClass;

  const playButtonClassName = cn(
    playButtonBaseClass,
    isShowStartText
      ? "w-auto min-h-12 gap-[12px] p-[16px] items-center justify-center text-center"
      : "size-12",
  );

  const playSpinnerSizeClass = isShowStartText ? "size-5" : "size-4";

  const tagChipClass = cn(
    "inline-flex items-center justify-center rounded-full border p-[12px]",
    "align-middle text-[16px] font-bold not-italic leading-[100%]",
    isHighlighted
      ? "border-white/30 text-white"
      : "border-gi-primary/10 text-gi-primary",
  );

  const expandedBody = (
    <div className="flex flex-col gap-2 pt-2">
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
    <div
      className={cn(
        "flex w-full",
        isHighlighted ? "bg-gi-primary" : quizCardDefaultSurfaceBgClass,
      )}
    >
      <div className={ctaBadgeInnerClass}>{cta}</div>
    </div>
  ) : null;

  const mainBlock = (
    <div
      className={cn(
        "p-4",
        isHighlighted ? "bg-gi-primary" : quizCardDefaultSurfaceBgClass,
      )}
    >
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
                aria-expanded={isExpanded}
                aria-label={isExpanded ? t`Zwiń` : t`Rozwiń`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded((v) => !v);
                }}
              >
                <img
                  src={isExpanded ? chevronUpIconUrl : chevronDownIconUrl}
                  alt=""
                  width={16}
                  height={16}
                  className={chevronIconClass}
                />
              </button>
            ) : null}

            {!isButtonDisabled ? (
              <button
                type="button"
                aria-busy={isButtonLoading ? true : undefined}
                className={playButtonClassName}
                aria-label={t`Rozpocznij quiz`}
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick();
                }}
              >
                {isShowStartText ? (
                  <span className={playStartLabelTypographyClass}>
                    <Trans>Rozpocznij</Trans>
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
                ) : !isMainAction && !isHighlighted ? (
                  <span className={playIconSlotClass} aria-hidden>
                    <svg
                      className="size-4"
                      width={16}
                      height={16}
                      viewBox="0 0 14 16"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        fill="currentColor"
                        d="M13.2625 6.70935L2.2625 0.206225C1.36875 -0.3219 0 0.1906 0 1.49685V14.5C0 15.6719 1.27188 16.3781 2.2625 15.7906L13.2625 9.2906C14.2437 8.71247 14.2469 7.28747 13.2625 6.70935Z"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className={playIconSlotClass} aria-hidden>
                    <img
                      src={playIconUrl}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 brightness-0 invert"
                    />
                  </span>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {effectiveAlwaysExpanded ? (
          expandedBody
        ) : (
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              "md:grid-rows-[1fr]",
            )}
            aria-hidden={!isExpanded && !isMdUp ? true : undefined}
          >
            <div className="min-h-0 overflow-hidden">
              <div inert={!isExpanded && !isMdUp ? true : undefined}>
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
          className={cn(
            "relative w-full overflow-hidden",
            quizCardDefaultSurfaceBgClass,
          )}
          style={{ height: HERO_IMAGE_HEIGHT_PX }}
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
