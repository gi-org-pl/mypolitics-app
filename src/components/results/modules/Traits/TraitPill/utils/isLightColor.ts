const LIGHT_LUMINANCE_THRESHOLD = 0.5;

const ANGLE_TO_DEGREES: Record<string, number> = {
  deg: 1,
  grad: 0.9,
  rad: 180 / Math.PI,
  turn: 360,
};

const clamp = (value: number): number => Math.min(Math.max(value, 0), 1);

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

const getRgbLuminance = (red: number, green: number, blue: number): number =>
  0.2126 * toLinear(clamp(red)) +
  0.7152 * toLinear(clamp(green)) +
  0.0722 * toLinear(clamp(blue));

const getHslLuminance = (
  hue: number,
  saturation: number,
  lightness: number,
): number => {
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const getChannel = (offset: number): number => {
    const position = (offset + hue / 30) % 12;

    return (
      lightness - chroma * Math.max(-1, Math.min(position - 3, 9 - position, 1))
    );
  };

  return getRgbLuminance(getChannel(0), getChannel(8), getChannel(4));
};

const getHwbLuminance = (
  hue: number,
  whiteness: number,
  blackness: number,
): number => {
  const total = whiteness + blackness;

  if (total >= 1) {
    const gray = whiteness / total;

    return getRgbLuminance(gray, gray, gray);
  }

  const scale = 1 - total;
  const getChannel = (offset: number): number => {
    const position = (offset + hue / 30) % 12;
    const pure =
      0.5 - 0.5 * Math.max(-1, Math.min(position - 3, 9 - position, 1));

    return pure * scale + whiteness;
  };

  return getRgbLuminance(getChannel(0), getChannel(8), getChannel(4));
};

const getLabLuminance = (lightness: number): number =>
  lightness > 8 ? ((lightness + 16) / 116) ** 3 : lightness / 903.3;

const getHexLuminance = (hex: string): { luminance: number; alpha: number } => {
  const digits = hex.length <= 4 ? hex.replace(/./g, "$&$&") : hex;
  const getChannel = (index: number): number =>
    Number.parseInt(digits.slice(index * 2, index * 2 + 2), 16) / 255;

  return {
    luminance: getRgbLuminance(getChannel(0), getChannel(1), getChannel(2)),
    alpha: digits.length === 8 ? getChannel(3) : 1,
  };
};

const getFunctionLuminance = (name: string, tokens: string[]): number => {
  const [first, second, third] = tokens;
  const hue = ((toDegrees(first) % 360) + 360) % 360;

  switch (name) {
    case "rgb":
    case "rgba": {
      return getRgbLuminance(
        toNumber(first, 255) / 255,
        toNumber(second, 255) / 255,
        toNumber(third, 255) / 255,
      );
    }
    case "hsl":
    case "hsla": {
      return getHslLuminance(
        hue,
        clamp(toNumber(second, 100) / 100),
        clamp(toNumber(third, 100) / 100),
      );
    }
    case "hwb": {
      return getHwbLuminance(
        hue,
        clamp(toNumber(second, 100) / 100),
        clamp(toNumber(third, 100) / 100),
      );
    }
    case "lab":
    case "lch": {
      return getLabLuminance(clamp(toNumber(first, 100) / 100) * 100);
    }
    default: {
      return clamp(toNumber(first)) ** 3;
    }
  }
};

export const isLightColor = (color?: string): boolean => {
  const value = typeof color === "string" ? color.trim().toLowerCase() : "";
  const hex = value.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/)?.[1];
  const notation = value.match(/^([a-z]+)\((.*)\)$/);

  if (!hex && !notation) return false;

  const tokens = (notation?.[2] ?? "").split(/[\s,/]+/).filter(Boolean);
  const { luminance, alpha } = hex
    ? getHexLuminance(hex)
    : {
        luminance: getFunctionLuminance(notation?.[1] ?? "", tokens),
        alpha: tokens.length > 3 ? clamp(toNumber(tokens[3])) : 1,
      };

  return luminance * alpha + (1 - alpha) > LIGHT_LUMINANCE_THRESHOLD;
};
