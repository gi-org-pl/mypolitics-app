import { getContrastRatio } from "@/utils/color/getContrastRatio";
import { isLightColor } from "@/utils/color/isLightColor";
import { toLongHex } from "@/utils/color/toLongHex";

import {
  MIN_TITLE_CONTRAST,
  PRIMARY_TEXT_COLOR,
  TINT_ALPHA,
  WHITE_TEXT_COLOR,
} from "../QuadrantTitle.constants";
import type { TitleLook, TitleTone } from "../QuadrantTitle.types";

// How the title of a quadrant is written. Without a colour it is neutral.
// With one, the moderate title is the colour on a tint of it, and the
// extreme title is white on the colour - the colored tone - as long as that
// text has the contrast it needs; otherwise it is in the primary colour of
// the palette (the light tone). The extreme title takes white whenever white
// reads better than the primary colour, even below the threshold: a colour of
// middle lightness leaves neither with 4.5:1. A colour written in another
// notation than plain hex falls back to its lightness.
export const getTitleTone = (look: TitleLook, color?: string): TitleTone => {
  if (!color) return "neutral";

  const hex = toLongHex(color);

  if (!hex) return isLightColor(color) ? "light" : "colored";

  if (look === "moderate") {
    const onTint = getContrastRatio(hex, `${hex}${TINT_ALPHA}`) ?? 0;

    return onTint >= MIN_TITLE_CONTRAST ? "colored" : "light";
  }

  const white = getContrastRatio(WHITE_TEXT_COLOR, hex) ?? 0;
  const primary = getContrastRatio(PRIMARY_TEXT_COLOR, hex) ?? 0;

  return white >= MIN_TITLE_CONTRAST || white >= primary ? "colored" : "light";
};
