import { useLingui } from "@lingui/react/macro";

import quizBannerBackground from "@/assets/images/home/quiz-banner-bg.png";
import quizBannerContent from "@/assets/images/home/quiz-banner-content.png";

import {
  FLOAT_CLASS_NAME,
  FLOAT_KEYFRAMES,
} from "./FeaturedQuizBanner.constants";

// The banner is a picture frame: it is as wide as its parent and as tall as
// the parent makes it, and never lower than the picture needs. Its pictures
// load lazily, so a page that does not display the banner on a narrow screen
// does not download them there.
export const FeaturedQuizBanner = () => {
  const { t } = useLingui();

  return (
    <div className="relative h-full min-h-58.5 w-full overflow-hidden rounded-4xl bg-gi-dark-primary">
      <style>{FLOAT_KEYFRAMES}</style>

      <img
        src={quizBannerBackground}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={quizBannerContent}
          alt={t`Podgląd wyników quizu myPolitics`}
          loading="lazy"
          className={`w-auto max-w-none shrink-0 drop-shadow-[0_0_32px_rgba(0,0,0,0.5)] ${FLOAT_CLASS_NAME}`}
        />
      </div>
    </div>
  );
};
