import { t } from "@lingui/core/macro";
import React from "react";
import quizBannerBg from "@/assets/images/home/quiz-banner-bg.png";
import quizBannerContent from "@/assets/images/home/quiz-banner-content.png";

const FeaturedQuizBanner: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes quiz-banner-float {
          0%,
          100% {
            transform: translate(0px, 0px);
          }
          25% {
            transform: translate(6px, -6px);
          }
          50% {
            transform: translate(0px, -10px);
          }
          75% {
            transform: translate(-6px, -6px);
          }
        }
      `}</style>
      <div className="relative flex h-[292px] w-full items-center justify-center overflow-hidden rounded-4xl bg-[#01171B]">
        <img
          src={quizBannerBg}
          alt={t`mypolitics banner background`}
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <img
          src={quizBannerContent}
          alt={t`mypolitics banner content`}
          className="relative h-[calc(100%+30px)] w-auto animate-[quiz-banner-float_4s_ease-in-out_infinite] motion-reduce:animate-none object-contain drop-shadow-[0_0_32px_rgba(0,0,0,0.5)]"
        />
      </div>
    </>
  );
};

export default FeaturedQuizBanner;
