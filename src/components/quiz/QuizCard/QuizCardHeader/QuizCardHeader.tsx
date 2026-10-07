import type { QuizCardHeaderProps } from "./QuizCardHeader.types";
import { QuizCardLogo } from "./QuizCardLogo/QuizCardLogo";
import { QuizCardPlayButton } from "./QuizCardPlayButton/QuizCardPlayButton";
import { QuizCardTitle } from "./QuizCardTitle/QuizCardTitle";
import { QuizCardToggle } from "./QuizCardToggle/QuizCardToggle";

// The heading exists only when the card has a title to name it with: a logo
// without one is a decorative image and stays outside any heading.
export const QuizCardHeader = ({
  title,
  logoUrl,
  logoHeight,
  bodyId,
  isOpen,
  isCollapsible,
  isOpenOnWideScreen,
  isShowStartText,
  isButtonLoading,
  isButtonDisabled,
  onToggle,
  onButtonClick,
  onCardClick,
}: QuizCardHeaderProps) => (
  <div className="flex min-h-12 items-center justify-between gap-6">
    {title ? (
      <QuizCardTitle onClick={onCardClick}>
        {logoUrl ? (
          <QuizCardLogo url={logoUrl} title={title} height={logoHeight} />
        ) : (
          title
        )}
      </QuizCardTitle>
    ) : (
      logoUrl && <QuizCardLogo url={logoUrl} height={logoHeight} />
    )}

    <div className="ml-auto flex shrink-0 items-center gap-2">
      {isCollapsible && (
        <QuizCardToggle
          bodyId={bodyId}
          isOpen={isOpen}
          isHiddenOnWideScreen={isOpenOnWideScreen}
          onToggle={onToggle}
        />
      )}

      {!isButtonDisabled && (
        <QuizCardPlayButton
          isLight={!logoUrl && Boolean(title)}
          isShowStartText={isShowStartText}
          isLoading={isButtonLoading}
          onClick={onButtonClick}
        />
      )}
    </div>
  </div>
);
