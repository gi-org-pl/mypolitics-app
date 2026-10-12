import { useUrlFailure } from "@/utils/url/useUrlFailure";

import { LOGO_HEIGHT_CLASS_NAMES } from "./QuizCardLogo.constants";
import type { QuizCardLogoProps } from "./QuizCardLogo.types";

// A logo that fails to load gives way to the title as text: the alternative
// text of a broken image is clipped by the logo's height in one browser and
// not drawn at all in another.
export const QuizCardLogo = ({ url, title, height }: QuizCardLogoProps) => {
  const { hasFailed, markFailed } = useUrlFailure(url);

  return hasFailed ? (
    title
  ) : (
    <img
      src={url}
      alt={title ?? ""}
      className={`block w-auto max-w-full min-w-0 object-contain object-left ${LOGO_HEIGHT_CLASS_NAMES[height]}`}
      onError={markFailed}
    />
  );
};
