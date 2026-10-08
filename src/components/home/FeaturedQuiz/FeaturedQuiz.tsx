import { FeaturedQuizBanner } from "@/components/quiz/FeaturedQuizBanner/FeaturedQuizBanner";

import { HomeQuizCard } from "../HomeQuizCard/HomeQuizCard";
import {
  BANNER_CLASS_NAME,
  WIDE_ROW_CLASS_NAME,
} from "./FeaturedQuiz.constants";
import type { FeaturedQuizProps } from "./FeaturedQuiz.types";

export const FeaturedQuiz = ({ quiz, onStart }: FeaturedQuizProps) => (
  <div className={`grid w-full gap-4 ${WIDE_ROW_CLASS_NAME}`}>
    <HomeQuizCard quiz={quiz} isFeatured onStart={onStart} />

    <div className={BANNER_CLASS_NAME}>
      <FeaturedQuizBanner />
    </div>
  </div>
);
