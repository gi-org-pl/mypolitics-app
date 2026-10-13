import type { ResultModule } from "@/types/results";
import type { Survey, SurveyAxis } from "@/types/survey";

// The axes a record lists, in the author's order. An axis the quiz does not
// have is left out.
export const getRecordAxes = (
  record: Pick<ResultModule, "axisIds">,
  survey: Pick<Survey, "axes">,
): SurveyAxis[] =>
  record.axisIds.flatMap(
    (axisId) => survey.axes.find(({ id }) => id === axisId) ?? [],
  );
