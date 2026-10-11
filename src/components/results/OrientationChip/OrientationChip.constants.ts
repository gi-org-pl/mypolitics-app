import type { OrientationChipLook } from "./OrientationChip.types";

const OUTLINED_CLASS_NAME = "border border-gi-ash";

export const LOOK_CLASS_NAMES: Record<OrientationChipLook, string> = {
  emphasised: "text-white",
  quiet: `${OUTLINED_CLASS_NAME} text-gi-dark-ash`,
  neutral: `${OUTLINED_CLASS_NAME} text-gi-primary`,
};
