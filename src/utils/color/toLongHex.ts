const SHORT_HEX_PATTERN = /^#([\da-f])([\da-f])([\da-f])$/i;
const LONG_HEX_PATTERN = /^#[\da-f]{6}$/i;

// A colour written as 3 or 6 hex digits, as 6 - so that an alpha can be added
// to it. Nothing for any other notation, a hex colour with an alpha included.
export const toLongHex = (color?: string): string | undefined => {
  const trimmed = typeof color === "string" ? color.trim() : "";
  const long = trimmed.replace(SHORT_HEX_PATTERN, "#$1$1$2$2$3$3");

  return LONG_HEX_PATTERN.test(long) ? long : undefined;
};
