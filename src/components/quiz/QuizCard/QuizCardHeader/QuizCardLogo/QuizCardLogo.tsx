import { LOGO_HEIGHT_CLASS_NAMES } from "../../QuizCard.constants";
import type { QuizCardLogoProps } from "./QuizCardLogo.types";

export const QuizCardLogo = ({ url, title, height }: QuizCardLogoProps) => (
  <img
    src={url}
    alt={title ?? ""}
    className={`block w-auto max-w-full object-contain object-left ${LOGO_HEIGHT_CLASS_NAMES[height]}`}
  />
);
