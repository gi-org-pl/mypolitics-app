import { t } from "@lingui/core/macro";
import quizBannerContent from "@/assets/images/home/quiz-banner-content.png";

const FeaturedQuizBanner = () => {
  return (
    <div className="relative overflow-hidden">
      <img
        src={quizBannerContent}
        alt={t`mypolitics banner content`}
        className="animate-quiz-banner-float w-full h-auto"
      />
    </div>
  );
};

export default FeaturedQuizBanner;
