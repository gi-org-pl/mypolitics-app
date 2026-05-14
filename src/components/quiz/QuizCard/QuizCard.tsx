import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { ReactElement, ReactNode } from "react";
import { useState, useSyncExternalStore } from "react";
import { twMerge } from "tailwind-merge";

import chevronDownVectorUrl from "@/assets/vectors/fa-solid_chevron-down.svg";
import playVectorUrl from "@/assets/vectors/fa-solid_play.svg";

import type { QuizCardProps } from "./QuizCard.types";

const HERO_IMAGE_HEIGHT_PX = 102;

/** Tailwind `md` breakpoint — desktop cards stay expanded with no chevron (see product spec). */
const MD_MIN_WIDTH_QUERY = "(min-width: 48rem)";

function useMinMd(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(MD_MIN_WIDTH_QUERY);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(MD_MIN_WIDTH_QUERY).matches,
    () => false,
  );
}

function cn(...parts: Array<string | false | undefined>): string {
  return twMerge(parts.filter(Boolean).join(" "));
}

const playButtonFocusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-secondary";

/** Filled primary — when `isMainAction` is true */
const playButtonFilledClass = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-0 bg-gi-primary text-white hover:bg-gi-primary-hover",
  playButtonFocusClass,
);

/** Outline on default (ash) card — border + play icon uses `currentColor` (= theme primary via `text-gi-primary`) */
const playButtonOutlineDefaultClass = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-gi-primary bg-transparent text-gi-primary hover:bg-gi-dark-ash/20",
  playButtonFocusClass,
);

/** Outline on highlighted (primary) card — light border + light icon for contrast */
const playButtonOutlineHighlightedClass = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20",
  playButtonFocusClass,
);

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
  const isMdUp = useMinMd();
  const logoAlt = title?.trim() ?? "";

  /** Image cards behave like `isAlwaysExpanded` on every viewport (spec §3). */
  const effectiveAlwaysExpanded =
    isAlwaysExpanded || Boolean(backgroundUrl) || isHighlighted;
  /** Standard cards: chevron only on small viewports; ≥ md always expanded (spec §2). */
  const showExpandChrome = !effectiveAlwaysExpanded && !isMdUp;

  const handleCardClick = (): void => {
    onCardClick?.();
  };

  const shell = cn(
    "w-full overflow-hidden rounded-[24px] border p-0",
    onCardClick && "cursor-pointer",
    isHighlighted
      ? "border-gi-primary bg-gi-primary text-white"
      : "border-gi-dark-ash bg-gi-ash text-gi-primary",
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
    "inline-flex size-12 shrink-0 items-center justify-center rounded-full border",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-secondary",
    isHighlighted
      ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
      : "border-gi-primary bg-gi-ash hover:bg-gi-dark-ash/20",
  );

  const chevronIconClass = "pointer-events-none h-4 w-4 shrink-0";

  const playButtonVariantClass = isMainAction
    ? playButtonFilledClass
    : isHighlighted
      ? playButtonOutlineHighlightedClass
      : playButtonOutlineDefaultClass;

  const playSpinnerSizeClass = isShowStartText ? "size-5" : "size-4";

  const tagChipClass = cn(
    "inline-flex items-center justify-center rounded-full border p-[12px]",
    "align-middle text-[16px] font-bold not-italic leading-[100%]",
    isHighlighted
      ? "border-white/30 text-white"
      : "border-[#0045541A] text-gi-primary",
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

  const mainBlock = (
    <div className={cn("p-4", isHighlighted ? "bg-gi-primary" : "bg-gi-ash")}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 self-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoAlt}
                height={logoHeight}
                className="h-auto w-auto max-w-[200px] object-contain"
                style={{ height: logoHeight }}
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
                  src={chevronDownVectorUrl}
                  alt=""
                  width={16}
                  height={16}
                  className={cn(chevronIconClass, isExpanded && "rotate-180")}
                />
              </button>
            ) : null}

            {!isButtonDisabled ? (
              <button
                type="button"
                aria-busy={isButtonLoading ? true : undefined}
                className={cn(
                  playButtonVariantClass,
                  isShowStartText
                    ? "w-auto gap-[12px] p-[16px] text-center text-[16px] font-bold leading-[100%]"
                    : "size-12",
                )}
                aria-label={t`Rozpocznij quiz`}
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick();
                }}
              >
                {isShowStartText ? (
                  <span>
                    <Trans>Rozpocznij</Trans>
                  </span>
                ) : null}
                {isButtonLoading ? (
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center text-current",
                      playSpinnerSizeClass,
                    )}
                    aria-hidden
                  >
                    <svg
                      className="size-full animate-spin motion-reduce:animate-none"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                ) : !isMainAction && !isHighlighted ? (
                  <svg
                    className="pointer-events-none h-4 w-4 shrink-0"
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
                ) : (
                  <img
                    src={playVectorUrl}
                    alt=""
                    width={16}
                    height={16}
                    className="pointer-events-none h-4 w-4 shrink-0 brightness-0 invert"
                  />
                )}
              </button>
            ) : null}
          </div>
        </div>

        {effectiveAlwaysExpanded || isMdUp ? (
          expandedBody
        ) : (
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
            aria-hidden={!isExpanded}
          >
            <div className="min-h-0 overflow-hidden">
              <div inert={!isExpanded ? true : undefined}>{expandedBody}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ctaPaddingClass = backgroundUrl
    ? "px-[12px] py-[8px]"
    : "px-[16px] py-[12px]";

  const ctaStrip = cta ? (
    <div className="flex w-full bg-gi-ash">
      <div
        className={cn(
          "bg-gi-primary text-left text-[14px] font-[700] leading-[120%] text-white",
          "rounded-br-2xl",
          ctaPaddingClass,
        )}
      >
        {cta}
      </div>
    </div>
  ) : null;

  return (
    <article
      className={shell}
      onClick={onCardClick ? handleCardClick : undefined}
    >
      {isHighlighted && ctaStrip}
      {backgroundUrl ? (
        <div
          className="relative w-full overflow-hidden bg-gi-ash"
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

      {!isHighlighted && ctaStrip}

      {mainBlock}
    </article>
  );
}
