import Checkmark from "../../../assets/icons/checkmark.svg";
import CheckmarkStrong from "../../../assets/icons/checkmark-strong.svg";
import CircleChecked from "../../../assets/icons/circle-checked.svg";
import CircleEmpty from "../../../assets/icons/circle-empty.svg";
import Dash from "../../../assets/icons/dash.svg";
import X from "../../../assets/icons/x.svg";
import XStrong from "../../../assets/icons/x-strong.svg";

export const CLICK_ANIMATION_MS = 500;
export const RIPPLE_FADE_MS = 150;

export const ANSWER_TYPE_CONFIG = {
  "strongly-agree": {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "color-mix(in srgb, var(--color-gi-green) 20%, transparent)",
    iconName: CheckmarkStrong,
  },
  agree: {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "color-mix(in srgb, var(--color-gi-green) 20%, transparent)",
    iconName: Checkmark,
  },
  disagree: {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "color-mix(in srgb, var(--color-gi-red) 20%, transparent)",
    iconName: X,
  },
  "strongly-disagree": {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "color-mix(in srgb, var(--color-gi-red) 20%, transparent)",
    iconName: XStrong,
  },
  custom: {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "color-mix(in srgb, var(--color-gi-gray) 20%, transparent)",
    iconName: Dash,
  },
  "custom-selectable-unselected": {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "",
    iconName: CircleEmpty,
  },
  "custom-selectable-selected": {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "",
    iconName: CircleChecked,
  },
} as const;
