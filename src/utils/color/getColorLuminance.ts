import { clamp } from "@/utils/number/clamp";

const ANGLE_TO_DEGREES: Record<string, number> = {
  deg: 1,
  grad: 0.9,
  rad: 180 / Math.PI,
  turn: 360,
};

const toNumber = (token = "", percentScale = 1): number => {
  const value = Number.parseFloat(token);

  if (!Number.isFinite(value)) return 0;

  return token.endsWith("%") ? (value / 100) * percentScale : value;
};

const toDegrees = (token = ""): number => {
  const unit = token.match(/[a-z]+$/i)?.[0].toLowerCase() ?? "deg";

  return toNumber(token) * (ANGLE_TO_DEGREES[unit] ?? 1);
};

const toLinear = (channel: number): number =>
  channel <= 0.040_45 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const toChannel = (linear: number): number =>
  linear <= 0.003_130_8 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - 0.055;

// A browser lays a translucent colour over the surface channel by channel, in
// sRGB, and what is seen has the luminance of that mix - so white is mixed in
// before a channel is made linear, not after.
const toLinearOverWhite = (channel: number, alpha: number): number =>
  toLinear(clamp(channel, 0, 1) * alpha + (1 - alpha));

const getRgbLuminance = (
  red: number,
  green: number,
  blue: number,
  alpha: number,
): number =>
  0.2126 * toLinearOverWhite(red, alpha) +
  0.7152 * toLinearOverWhite(green, alpha) +
  0.0722 * toLinearOverWhite(blue, alpha);

// lab(), lch(), oklab() and oklch() are read for their lightness alone, so
// they have no channels to mix: a translucent one is taken as the grey of the
// same luminance.
const getGrayLuminance = (luminance: number, alpha: number): number =>
  alpha < 1 ? toLinearOverWhite(toChannel(luminance), alpha) : luminance;

const getHslLuminance = (
  hue: number,
  saturation: number,
  lightness: number,
  alpha: number,
): number => {
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const getChannel = (offset: number): number => {
    const position = (offset + hue / 30) % 12;

    return (
      lightness - chroma * Math.max(-1, Math.min(position - 3, 9 - position, 1))
    );
  };

  return getRgbLuminance(getChannel(0), getChannel(8), getChannel(4), alpha);
};

const getHwbLuminance = (
  hue: number,
  whiteness: number,
  blackness: number,
  alpha: number,
): number => {
  const total = whiteness + blackness;

  if (total >= 1) {
    const gray = whiteness / total;

    return getRgbLuminance(gray, gray, gray, alpha);
  }

  const scale = 1 - total;
  const getChannel = (offset: number): number => {
    const position = (offset + hue / 30) % 12;
    const pure =
      0.5 - 0.5 * Math.max(-1, Math.min(position - 3, 9 - position, 1));

    return pure * scale + whiteness;
  };

  return getRgbLuminance(getChannel(0), getChannel(8), getChannel(4), alpha);
};

const getLabLuminance = (lightness: number): number =>
  lightness > 8 ? ((lightness + 16) / 116) ** 3 : lightness / 903.3;

const getHexLuminance = (hex: string): number => {
  const digits = hex.length <= 4 ? hex.replace(/./g, "$&$&") : hex;
  const getChannel = (index: number): number =>
    Number.parseInt(digits.slice(index * 2, index * 2 + 2), 16) / 255;

  return getRgbLuminance(
    getChannel(0),
    getChannel(1),
    getChannel(2),
    digits.length === 8 ? getChannel(3) : 1,
  );
};

const getFunctionLuminance = (name: string, tokens: string[]): number => {
  const [first, second, third, fourth] = tokens;
  const alpha = fourth === undefined ? 1 : clamp(toNumber(fourth), 0, 1);
  const hue = ((toDegrees(first) % 360) + 360) % 360;

  switch (name) {
    case "rgb":
    case "rgba": {
      return getRgbLuminance(
        toNumber(first, 255) / 255,
        toNumber(second, 255) / 255,
        toNumber(third, 255) / 255,
        alpha,
      );
    }
    case "hsl":
    case "hsla": {
      return getHslLuminance(
        hue,
        clamp(toNumber(second, 100) / 100, 0, 1),
        clamp(toNumber(third, 100) / 100, 0, 1),
        alpha,
      );
    }
    case "hwb": {
      return getHwbLuminance(
        hue,
        clamp(toNumber(second, 100) / 100, 0, 1),
        clamp(toNumber(third, 100) / 100, 0, 1),
        alpha,
      );
    }
    case "lab":
    case "lch": {
      return getGrayLuminance(
        getLabLuminance(clamp(toNumber(first, 100) / 100, 0, 1) * 100),
        alpha,
      );
    }
    default: {
      return getGrayLuminance(clamp(toNumber(first), 0, 1) ** 3, alpha);
    }
  }
};

// Relative luminance of the colour as it is drawn on a white surface, from 0
// (black) to 1 (white); undefined for a value that is neither a hex colour
// nor a functional notation.
export const getColorLuminance = (color?: string): number | undefined => {
  const value = typeof color === "string" ? color.trim().toLowerCase() : "";
  const hex = value.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/)?.[1];
  const [, name, body] = value.match(/^([a-z]+)\((.*)\)$/) ?? [];

  if (!hex && !name) return undefined;

  const tokens = (body ?? "").split(/[\s,/]+/).filter(Boolean);

  return hex ? getHexLuminance(hex) : getFunctionLuminance(name, tokens);
};
