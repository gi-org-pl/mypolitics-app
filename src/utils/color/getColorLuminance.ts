const HEX_COLOR_PATTERN = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;

const toLinear = (channel: number): number =>
  channel <= 0.040_45 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

// Relative luminance of a hex colour as it is drawn on a white surface, from
// 0 (black) to 1 (white). A browser lays a translucent colour over the
// surface channel by channel, so white is mixed in before a channel is made
// linear. Only hex is read - the notation the API sends; undefined for any
// other value, a functional notation included.
export const getColorLuminance = (color?: string): number | undefined => {
  const hex = (typeof color === "string" ? color.trim() : "").match(
    HEX_COLOR_PATTERN,
  )?.[1];

  if (hex === undefined) return undefined;

  const digits = hex.length <= 4 ? hex.replace(/./g, "$&$&") : hex;
  const [red, green, blue, alpha = 1] = (digits.match(/../g) ?? []).map(
    (pair) => Number.parseInt(pair, 16) / 255,
  );
  const toDrawn = (channel: number): number =>
    toLinear(channel * alpha + (1 - alpha));

  return (
    0.2126 * toDrawn(red) + 0.7152 * toDrawn(green) + 0.0722 * toDrawn(blue)
  );
};
