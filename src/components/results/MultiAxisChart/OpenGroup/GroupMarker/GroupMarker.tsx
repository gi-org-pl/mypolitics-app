import type { CSSProperties } from "react";

import { AXIS_LINE_BACKGROUND_CLASS_NAME } from "@/constants/axis";
import { getAxisLayout } from "@/utils/axis/getAxisLayout";

interface GroupMarkerProps {
  marker?: number | false;
}

export const GroupMarker = ({ marker }: GroupMarkerProps) => {
  const position = getAxisLayout({ marker }).marker;

  if (position === null) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-5 -top-15 bottom-4"
    >
      <div
        data-testid="multi-axis-chart-marker"
        className={`absolute inset-y-0 left-[clamp(0px,calc(var(--axis-position)-0.5px),calc(100%-1px))] w-px ${AXIS_LINE_BACKGROUND_CLASS_NAME}`}
        style={{ "--axis-position": `${position}%` } as CSSProperties}
      />
    </div>
  );
};
