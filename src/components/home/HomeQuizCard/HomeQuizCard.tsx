import { Trans, useLingui } from "@lingui/react";

import { QuizCard } from "@/components/quiz/QuizCard/QuizCard";

import type { HomeQuizCardProps } from "./HomeQuizCard.types";

// A quiz of the home page as a card: the texts of the quiz are translated
// here, and the lead of its description is set in bold. The featured card is
// the highlighted one with the start label; its picture belongs to the card
// on a narrow screen only, because a wide one shows it in the banner beside
// the card.
export const HomeQuizCard = ({
  quiz,
  isFeatured = false,
  onStart,
}: HomeQuizCardProps) => {
  const { i18n } = useLingui();

  return (
    <QuizCard
      title={i18n._(quiz.name)}
      logoUrl={quiz.logoUrl}
      backgroundUrl={quiz.backgroundUrl}
      cta={quiz.badge && i18n._(quiz.badge)}
      description={
        quiz.description && (
          <Trans
            id={quiz.description.id}
            message={quiz.description.message}
            components={{ 0: <strong /> }}
          />
        )
      }
      tags={quiz.tags.map((tag) => i18n._(tag))}
      isHighlighted={isFeatured}
      isShowStartText={isFeatured}
      isImageHiddenOnWide={isFeatured}
      onButtonClick={onStart}
    />
  );
};
