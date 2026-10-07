import type { CSSProperties } from "react";

import {
  ROW_FADE_MS,
  ROW_STAGGER_MS,
} from "../../SurveyCategorySelect.constants";

export const getRowFadeStyle = (index: number): CSSProperties => ({
  transitionDuration: `${ROW_FADE_MS}ms`,
  transitionDelay: `${Math.max(0, index) * ROW_STAGGER_MS}ms`,
});
