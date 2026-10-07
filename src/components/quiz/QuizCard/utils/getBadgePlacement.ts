import type { QuizCardBadgePlacement } from "../QuizCardBadge/QuizCardBadge.types";

export const getBadgePlacement = (
  hasImage: boolean,
  isImageHiddenOnWideScreen: boolean,
): QuizCardBadgePlacement => {
  if (!hasImage) {
    return "top";
  }

  return isImageHiddenOnWideScreen ? "belowImageOnNarrowScreen" : "belowImage";
};
