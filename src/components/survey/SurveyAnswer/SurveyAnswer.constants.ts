export const CLICK_ANIMATION_MS = 150;

import { Checkmark } from "../../../assets/icons/checkmark";
import { CheckmarkStrong } from "../../../assets/icons/checkmark-strong";
import { CircleChecked } from "../../../assets/icons/circle-checked";
import { CircleEmpty } from "../../../assets/icons/circle-empty";
import { Dash } from "../../../assets/icons/dash";
import { X } from "../../../assets/icons/x";
import { XStrong } from "../../../assets/icons/x-strong";

export const ANSWER_TYPE_CONFIG = {
  "strongly-agree": {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "bg-gi-green",
    Icon: CheckmarkStrong,
  },
  agree: {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "bg-gi-green",
    Icon: Checkmark,
  },
  disagree: {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "bg-gi-red",
    Icon: X,
  },
  "strongly-disagree": {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "bg-gi-red",
    Icon: XStrong,
  },
  custom: {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "bg-gi-ash",
    Icon: Dash,
  },
  "custom-selectable-unselected": {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "",
    Icon: CircleEmpty,
  },
  "custom-selectable-selected": {
    bgClass: "bg-background",
    textClass: "text-gi-dark-gray",
    rippleColor: "",
    Icon: CircleChecked,
  },
} as const;
