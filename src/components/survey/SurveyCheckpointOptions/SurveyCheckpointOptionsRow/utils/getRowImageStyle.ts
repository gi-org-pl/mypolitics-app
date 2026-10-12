import type { CSSProperties } from "react";

import type { Orientation } from "@/types/orientation";
import { getSafeColor } from "@/utils/color/getSafeColor";
import { toCssUrl } from "@/utils/style/toCssUrl";

// What the disc of a row is painted with: the colour of the orientation and,
// over it, its image. A colour that is missing or is not a colour is left
// out, and so is a missing image - the disc then keeps the neutral colour of
// its class, or shows its colour alone.
export const getRowImageStyle = ({
  color,
  imageUrl,
}: Orientation): CSSProperties => {
  const backgroundColor = getSafeColor(color);
  const address = typeof imageUrl === "string" ? imageUrl.trim() : "";

  return {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(address === "" ? {} : { backgroundImage: toCssUrl(address) }),
  };
};
