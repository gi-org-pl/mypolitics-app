import { Avatar } from "@gi-org-pl/athena";

import { BAND_CLASS_NAME, IMAGE_CLASS_NAME } from "../ResultsHeader.constants";
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
    <svg
      aria-hidden="true"
      data-testid="results-header-ring"
      viewBox="0 0 65 65"
      className="absolute inset-0 size-full"
    >
      <circle
        cx="32.5"
        cy="32.5"
        r="32.5"
        className="fill-current opacity-10"
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
    {imageUrl ? (
      <Avatar
        src={imageUrl}
        dataTestId="results-header-image"
        className={`${IMAGE_CLASS_NAME} bg-gi-dark-primary`}
      />
    ) : (
      <div
        data-testid="results-header-image-placeholder"
        className={`${IMAGE_CLASS_NAME} bg-gi-dark-ash`}
      />
    )}
  </div>
);
