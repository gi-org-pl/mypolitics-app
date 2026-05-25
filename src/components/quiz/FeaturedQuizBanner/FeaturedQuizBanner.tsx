import React from "react";
import { t } from "@lingui/core/macro";
import quizBannerContent from "@/assets/images/home/quiz-banner-content.png";
import quizBannerBg from "@/assets/images/home/quiz-banner-bg.png";

const FeaturedQuizBanner: React.FC = () => {
  return (
    <div className="relative flex h-[292px] w-full items-center justify-center overflow-hidden rounded-[32px] bg-[#01171B]">
      <img
        src={quizBannerBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      <img
        src={quizBannerContent}
        alt={t`mypolitics banner content`}
        className="relative h-[calc(100%+30px)] w-auto animate-quiz-banner-float object-contain drop-shadow-[0_0_32px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
};

export default FeaturedQuizBanner;
