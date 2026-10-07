import type { CSSProperties } from "react";

export const getIconMaskStyle = (iconUrl: string): CSSProperties => {
  const image = `url("${iconUrl}")`;

  return { maskImage: image, WebkitMaskImage: image };
};
