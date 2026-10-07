import { IMAGE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME } from "./QuizCardImage.constants";
import type { QuizCardImageProps } from "./QuizCardImage.types";

// The image is a strip across the card: short while the card is collapsed,
// twice as tall once it is open.
export const QuizCardImage = ({
  url,
  isTall,
  isHiddenOnWideScreen,
}: QuizCardImageProps) => (
  <img
    src={url}
    alt=""
    className={`block w-full object-cover transition-[height] duration-300 ease-in-out motion-reduce:transition-none ${
      isTall ? "h-51" : "h-25.5"
    } ${isHiddenOnWideScreen ? IMAGE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME : ""}`}
  />
);
