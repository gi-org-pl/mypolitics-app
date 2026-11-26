import checkmarkIcon from "@/assets/icons/checkmark-strong.svg";
import crossIcon from "@/assets/icons/x-strong.svg";
import { Agreement } from "@/types/comparison";

import type { AnswerLook } from "./Answer.types";

// An answer by how it stands to the answer of the taker: a grey chip, with
// an outline and a mark - the tick and the cross of the questionnaire - when
// the two can be told to agree or not. The green of the design has no token
// in the palette: the closest one is used.
export const ANSWER_LOOKS: Record<Agreement, AnswerLook> = {
  [Agreement.Agree]: {
    chipClassName: "border-emerald-600/50 bg-gi-ash",
    markUrl: checkmarkIcon,
  },
  [Agreement.Disagree]: {
    chipClassName: "border-gi-red/50 bg-gi-ash",
    markUrl: crossIcon,
  },
  [Agreement.Neither]: { chipClassName: "border-transparent bg-gi-ash" },
};

// A side with no answer: an empty chip, and never a mark.
export const NO_ANSWER_LOOK: AnswerLook = { chipClassName: "border-gi-ash" };
