import type { QuizCardProps } from "./QuizCard.types";
import { QuizCardBadge } from "./QuizCardBadge/QuizCardBadge";
import { QuizCardBody } from "./QuizCardBody/QuizCardBody";
import { QuizCardHeader } from "./QuizCardHeader/QuizCardHeader";
import { QuizCardImage } from "./QuizCardImage/QuizCardImage";
import { useQuizCardView } from "./utils/useQuizCardView";

export const QuizCard = ({
  title,
  logoUrl,
  logoHeight = 24,
  backgroundUrl,
  cta,
  description,
  tags,
  isHighlighted = false,
  isAlwaysExpanded = false,
  isShowStartText = false,
  isButtonLoading = false,
  isButtonDisabled = false,
  onButtonClick,
  onCardClick,
}: QuizCardProps) => {
  const view = useQuizCardView({
    title,
    logoUrl,
    backgroundUrl,
    cta,
    description,
    tags,
    isHighlighted,
    isAlwaysExpanded,
    onCardClick,
  });

  // The click on the card is a shortcut for the mouse: the keyboard reaches
  // the same action through the title button inside the header.
  return (
    <article
      className={`w-full overflow-hidden rounded-3xl bg-gi-ash outline-1 -outline-offset-1 outline-[#d4e1e4] ${
        isHighlighted ? "md:rounded-4xl" : ""
      } ${view.onCardClick ? "cursor-pointer" : ""}`}
      onClick={view.onCardClick}
    >
      {view.imageUrl && (
        <QuizCardImage url={view.imageUrl} isTall={view.isOpen} />
      )}

      {view.badge && (
        <QuizCardBadge
          text={view.badge}
          isBelowImage={view.imageUrl !== undefined}
          isHighlighted={isHighlighted}
        />
      )}

      <div className={`p-4 ${isHighlighted ? "md:p-6" : ""}`}>
        <QuizCardHeader
          title={view.title}
          logoUrl={view.logoUrl}
          logoHeight={logoHeight}
          bodyId={view.bodyId}
          isOpen={view.isOpen}
          isCollapsible={view.isCollapsible}
          isOpenOnWideScreen={view.isOpenOnWideScreen}
          isShowStartText={isShowStartText}
          isButtonLoading={isButtonLoading}
          isButtonDisabled={isButtonDisabled}
          onToggle={view.toggle}
          onButtonClick={onButtonClick}
          onCardClick={view.onCardClick}
        />

        {view.hasBody && (
          <QuizCardBody
            id={view.bodyId}
            description={view.description}
            tags={tags}
            isOpen={view.isOpen}
            isOpenOnWideScreen={view.isOpenOnWideScreen}
            isHighlighted={isHighlighted}
          />
        )}
      </div>
    </article>
  );
};
