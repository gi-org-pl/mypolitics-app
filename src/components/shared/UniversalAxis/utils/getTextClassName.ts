import { isLightColor } from "@/utils/color/isLightColor";

// A value beside its fill is drawn on the white track: in the entry's own
// colour, unless that colour is too light to be read there.
export const getTextClassName = (color?: string): string => {
  if (isLightColor(color)) return "text-gi-primary";

  return color ? "text-(--axis-color)" : "text-gi-dark-gray";
};
