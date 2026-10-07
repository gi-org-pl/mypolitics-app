import {
  IMAGE_SHORT_CLASS_NAME,
  IMAGE_TALL_CLASS_NAME,
} from "./QuizCardImage.constants";
import type { QuizCardImageProps } from "./QuizCardImage.types";

export const QuizCardImage = ({ url, isTall }: QuizCardImageProps) => (
  <img
    src={url}
    alt=""
    className={`block w-full object-cover transition-[height] duration-300 ease-in-out motion-reduce:transition-none ${
      isTall ? IMAGE_TALL_CLASS_NAME : IMAGE_SHORT_CLASS_NAME
    }`}
  />
);
