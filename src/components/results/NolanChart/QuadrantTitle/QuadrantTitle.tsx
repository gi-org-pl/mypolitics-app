import { isLightColor } from "@/utils/color/isLightColor";

import type { NolanTitle } from "../NolanChart.types";
import { getColorStyle } from "../utils/getColorStyle";

const TEXT_CLASS_NAME = "min-w-0 truncate text-base leading-5 font-bold";

const LOOK_CLASS_NAMES = {
  moderate: {
    colored: "bg-(--nolan-color)/10 text-(--nolan-color)",
    light: "bg-(--nolan-color)/10 text-gi-primary",
    neutral: "bg-gi-dark-gray/10 text-gi-dark-gray",
  },
  extreme: {
    colored: "bg-(--nolan-color) text-white",
    light: "bg-(--nolan-color) text-gi-primary",
    neutral: "bg-gi-dark-gray text-white",
  },
};

interface QuadrantTitleProps extends Omit<NolanTitle, "look"> {
  look: "moderate" | "extreme";
}

export const QuadrantTitle = ({
  name,
  shortName,
  look,
  color,
}: QuadrantTitleProps) => (
  <div
    data-testid="nolan-chart-title"
    data-look={look}
    className={`@container flex h-8 w-full min-w-0 items-center justify-center rounded-lg px-4 ${LOOK_CLASS_NAMES[look][isLightColor(color) ? "light" : color ? "colored" : "neutral"]}`}
    style={getColorStyle(color)}
  >
    <span
      className={`${TEXT_CLASS_NAME} ${shortName ? "@max-[176px]:sr-only" : ""}`}
    >
      {name}
    </span>
    {shortName && (
      <span
        aria-hidden="true"
        data-testid="nolan-chart-title-short"
        className={`${TEXT_CLASS_NAME} hidden @max-[176px]:block`}
      >
        {shortName}
      </span>
    )}
  </div>
);
