import { Avatar } from "@gi-org-pl/athena";

import { AVATAR_WITHOUT_PLACEHOLDER_CLASS_NAME } from "@/constants/image";

import {
  BAND_CLASS_NAME,
  RING_IMAGE_CLASS_NAME,
  RING_OVERLAP,
  RING_TRACK_CLASS_NAME,
} from "../ResultsHeader.constants";
import type { ResultsHeaderBand } from "../ResultsHeader.types";

interface ResultsHeaderRingProps {
  confidence: number;
  band: ResultsHeaderBand;
  imageUrl?: string;
}

export const ResultsHeaderRing = ({
  confidence,
  band,
  imageUrl,
}: ResultsHeaderRingProps) => (
  <div className={`relative size-[65px] shrink-0 ${BAND_CLASS_NAME[band]}`}>
    {imageUrl ? (
      <Avatar
        src={imageUrl}
        dataTestId="results-header-image"
        className={`${RING_IMAGE_CLASS_NAME} bg-gi-dark-ash has-[>img]:bg-gi-dark-primary ${AVATAR_WITHOUT_PLACEHOLDER_CLASS_NAME}`}
      />
    ) : (
      <div
        data-testid="results-header-image-placeholder"
        className={`${RING_IMAGE_CLASS_NAME} bg-gi-dark-ash`}
      />
    )}
    <svg
      aria-hidden="true"
      data-testid="results-header-ring"
      viewBox="0 0 65 65"
      className="absolute inset-0 size-full"
    >
      <circle
        data-testid="results-header-ring-track"
        cx="32.5"
        cy="32.5"
        r="30"
        pathLength={100}
        strokeDasharray={`${RING_OVERLAP} ${confidence - 2 * RING_OVERLAP} ${100 - confidence + RING_OVERLAP}`}
        strokeWidth="5"
        className={RING_TRACK_CLASS_NAME}
      />
      <circle
        data-testid="results-header-ring-arc"
        cx="32.5"
        cy="32.5"
        r="30"
        pathLength={100}
        strokeDasharray={`${confidence} 100`}
        strokeWidth="5"
        className="fill-none stroke-current"
      />
    </svg>
  </div>
);
