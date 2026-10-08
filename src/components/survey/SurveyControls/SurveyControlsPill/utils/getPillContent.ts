import { toTrimmedText } from "@/utils/text/toTrimmedText";

import type {
  SurveyControlsPillContent,
  SurveyControlsPillProps,
} from "../../SurveyControls.types";
import { getQuestionsLeft } from "./getQuestionsLeft";

export const getPillContent = ({
  quizName,
  label,
  categoryName,
  questionsLeft,
}: SurveyControlsPillProps): SurveyControlsPillContent => {
  const labelText = toTrimmedText(label);

  if (labelText !== undefined) {
    return { text: labelText };
  }

  const categoryText = toTrimmedText(categoryName);
  const count = getQuestionsLeft(questionsLeft);

  if (categoryText !== undefined || count !== undefined) {
    return { text: categoryText, count };
  }

  return { text: toTrimmedText(quizName) };
};
