import { FeaturedQuiz } from "@/components/home/FeaturedQuiz/FeaturedQuiz";
import { FeaturesList } from "@/components/home/FeaturesList/FeaturesList";
import { PartnersList } from "@/components/home/PartnersList/PartnersList";
import { QuizSection } from "@/components/home/QuizSection/QuizSection";
import { PromotionBanner } from "@/components/shared/PromotionBanner/PromotionBanner";
import {
  FEATURED_QUIZ,
  HOME_PARTNER_SECTIONS,
  HOME_QUIZZES,
} from "@/constants/home";
import { doNothing } from "@/utils/function/doNothing";
import { useHomeContent } from "@/utils/home/useHomeContent";

// The spacing around and between the sections belongs to the page: the shell
// adds none. Starting a quiz, showing more quizzes and creating one have
// nothing behind them yet.
export default function HomePage() {
  const { promotions, features } = useHomeContent();

  return (
    <div className="mx-auto box-content flex max-w-300 flex-col gap-4 px-4 pt-4 pb-8 md:gap-8 md:pt-8 md:pb-24">
      <PromotionBanner promotions={promotions} />

      <FeaturedQuiz quiz={FEATURED_QUIZ} onStart={doNothing} />

      <FeaturesList features={features} />

      <PartnersList sections={HOME_PARTNER_SECTIONS} />

      <QuizSection
        quizzes={HOME_QUIZZES}
        onQuizStart={doNothing}
        onShowMore={doNothing}
        onCreate={doNothing}
      />
    </div>
  );
}
