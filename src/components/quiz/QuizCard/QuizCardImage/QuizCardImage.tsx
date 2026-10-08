import { IMAGE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME } from "./QuizCardImage.constants";
import type { QuizCardImageProps } from "./QuizCardImage.types";

// The image is a strip across the card: short while the card is collapsed,
// twice as tall once it is open. It loads lazily, so a picture that a wide
// screen hides is not downloaded there; `loading` comes before `src` because
// some browsers start the request as soon as the address is set.
export const QuizCardImage = ({
  url,
  isTall,
  isHiddenOnWideScreen,
}: QuizCardImageProps) => (
  <img
    loading="lazy"
    src={url}
    alt=""
    className={`block w-full object-cover transition-[height] duration-300 ease-in-out motion-reduce:transition-none ${
      isTall ? "h-51" : "h-25.5"
    } ${isHiddenOnWideScreen ? IMAGE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME : ""}`}
  />
);
