import {
  LOGO_SIGN_TRANSFORM,
  LOGO_VIEW_BOX,
  LOGO_WORDMARK_CLASS_NAME,
  LOGO_WORDMARK_PATH,
  LOGO_WORDMARK_TRANSFORM,
} from "./HeaderLogo.constants";
import type { HeaderLogoProps } from "./HeaderLogo.types";
import { useLogoAnimation } from "./utils/useLogoAnimation";

// The myPolitics primary logo of the header, drawn in code so that its sign
// can move: at rest it is mypolitics-primary-blue-on-light.svg, and for a new
// `playId` the gaps of the sign slide and its colours change once (see
// `LOGO_BEATS`). The wordmark never moves. The logo is decorative - the link
// around it carries the name.
export const HeaderLogo = ({ playId }: HeaderLogoProps) => {
  const { pieces, isPlaying } = useLogoAnimation(playId);

  return (
    <svg
      viewBox={LOGO_VIEW_BOX}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-6 w-auto"
      data-playing={isPlaying || undefined}
    >
      <g transform={LOGO_SIGN_TRANSFORM}>
        {pieces.map(({ id, d, fillClassName }) => (
          <path key={id} d={d} className={fillClassName} />
        ))}
      </g>
      <g transform={LOGO_WORDMARK_TRANSFORM}>
        <path d={LOGO_WORDMARK_PATH} className={LOGO_WORDMARK_CLASS_NAME} />
      </g>
    </svg>
  );
};
