import { Button } from "@gi/athena";
import type { MessageDescriptor } from "@lingui/core";
import { Trans, useLingui } from "@lingui/react";
import type { ReactElement, ReactNode } from "react";
import { useState, useSyncExternalStore } from "react";
import { twMerge } from "tailwind-merge";

import playIconUrl from "@/assets/icons/fa-solid_play.svg";
import playIconDarkUrl from "@/assets/icons/fa-solid_play-dark.svg";

import type { QuizCardProps } from "./QuizCard.types";

const HERO_IMAGE_HEIGHT_PX = 102;

const MD_MIN_WIDTH_MEDIA_QUERY = "(min-width: 48rem)";

function useIsMdViewport(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(MD_MIN_WIDTH_MEDIA_QUERY);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(MD_MIN_WIDTH_MEDIA_QUERY).matches,
    () => false,
  );
}

const quizCardMessages = {
  startQuiz: { id: "Rozpocznij quiz", message: "Rozpocznij quiz" },
  start: { id: "Rozpocznij", message: "Rozpocznij" },
  expand: { id: "Rozwiń", message: "Rozwiń" },
  collapse: { id: "Zwiń", message: "Zwiń" },
} as const satisfies Record<string, MessageDescriptor>;

function cn(...parts: Array<string | false | undefined>): string {
  return twMerge(parts.filter(Boolean).join(" "));
}

function ChevronDown({ className }: { className?: string }): ReactElement {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("pointer-events-none shrink-0 text-gi-primary", className)}
    >
      <path
        d="M6.46966 11.9211L0.396437 5.84786C0.103531 5.55496 0.103531 5.08008 0.396437 4.78721L1.10478 4.07886C1.39719 3.78646 1.87109 3.7859 2.16419 4.07761L7 8.89077L11.8358 4.07761C12.1289 3.7859 12.6028 3.78646 12.8952 4.07886L13.6035 4.78721C13.8964 5.08011 13.8964 5.55499 13.6035 5.84786L7.53034 11.9211C7.23744 12.214 6.76256 12.214 6.46966 11.9211Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PlayIcon({ isMainAction }: { isMainAction: boolean }): ReactElement {
  return (
    <img
      src={isMainAction ? playIconUrl : playIconDarkUrl}
      alt=""
      width={16}
      height={16}
      className="size-4 shrink-0"
      aria-hidden
    />
  );
}

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
  const isMdUp = useIsMdViewport();
  const logoAlt = title?.trim() ?? "";
  const isLayoutAlwaysExpanded = isAlwaysExpanded;
  const showStartTextLabel = isShowStartText && isMdUp;

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
  );

  const titleClass =
    "m-0 min-w-0 text-left text-2xl font-bold leading-[120%] text-gi-primary";

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

  const iconChromeRingClass = "shrink-0 ring-1 ring-inset ring-gi-primary";
  const iconOnlyButtonSizeClass = "size-12 h-12 w-12";

  const playButtonType = isMainAction ? "primary" : "ghost";
  const playButtonClassName = cn(
    isMainAction && "border-0",
    !isMainAction && iconChromeRingClass,
    !isMainAction && !showStartTextLabel && iconOnlyButtonSizeClass,
    showStartTextLabel
      ? "min-h-12 flex-row-reverse gap-3 px-4 has-[>svg]:px-4 text-[16px] font-bold leading-[100%]"
      : isMainAction && iconOnlyButtonSizeClass,
  );

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
    "flex w-fit items-center justify-center bg-gi-primary text-left text-[14px] font-[700] leading-[120%] text-white",
    "rounded-br-2xl",
    backgroundUrl ? "min-h-[30px]" : "min-h-[38px]",
    ctaPaddingClass,
  );

  const ctaStrip = cta ? (
    <div className={cn("flex w-full", "bg-gi-ash")}>
      <div className={ctaBadgeInnerClass}>{cta}</div>
    </div>
  ) : null;

  const mainBlock = (
    <div className={cn("p-4", "bg-gi-ash")}>
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
              <Button
                type="ghost"
                variant="primary"
                isIconButton
                className={cn(
                  iconChromeRingClass,
                  iconOnlyButtonSizeClass,
                  "md:hidden",
                )}
                aria-expanded={isContentExpanded}
                aria-label={i18n._(
                  isContentExpanded
                    ? quizCardMessages.collapse
                    : quizCardMessages.expand,
                )}
                LeftIcon={
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-300 ease-in-out motion-reduce:transition-none",
                      isContentExpanded && "rotate-180",
                    )}
                  />
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpandedValue((v) => !v);
                }}
              />
            ) : null}

            {!isButtonDisabled ? (
              <Button
                  type={playButtonType}
                  variant="primary"
                  isIconButton={!showStartTextLabel}
                  isLoading={isButtonLoading}
                  className={playButtonClassName}
                  aria-label={i18n._(quizCardMessages.startQuiz)}
                  LeftIcon={<PlayIcon isMainAction={isMainAction} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onButtonClick();
                  }}
                >
                  {showStartTextLabel ? (
                    <Trans
                      id={quizCardMessages.start.id}
                      message={quizCardMessages.start.message}
                    />
                  ) : undefined}
              </Button>
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

      {cta ? ctaStrip : null}

      {mainBlock}
    </article>
  );
}
