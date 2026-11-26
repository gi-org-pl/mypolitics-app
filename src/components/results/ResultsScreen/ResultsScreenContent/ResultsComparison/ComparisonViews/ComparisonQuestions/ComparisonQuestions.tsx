import { useLingui } from "@lingui/react/macro";

import { SearchField } from "@/components/results/SearchField/SearchField";

import type { ComparisonViewProps } from "../../ResultsComparison.types";
import { QuestionFilter } from "./QuestionFilter/QuestionFilter";
import { QuestionList } from "./QuestionList/QuestionList";
import { useComparisonQuestions } from "./utils/useComparisonQuestions";

// The questions view of a comparison: every question of the quiz, in the
// order of the quiz, with what the taker and the other side answer it. Over
// the list stand a search field, which narrows it by the text of a question,
// and a switch, which keeps the questions the two disagree on.
//
// It is the view of both kinds of comparison. A friend has the answer they
// chose; an orientation has every answer of the question that lists it. What
// is listed, and which rows are open, is the state of one hook.
//
// The view is a container: the field and the switch stand in one row once
// both fit, whatever stands around the view.
export const ComparisonQuestions = ({
  survey,
  result,
  comparison,
}: ComparisonViewProps) => {
  const { t } = useLingui();
  const {
    search,
    isOnlyDisagreement,
    listed,
    openIds,
    setSearch,
    setIsOnlyDisagreement,
    toggleQuestion,
  } = useComparisonQuestions(survey, result.answers, comparison.other);

  return (
    <div className="@container w-full min-w-0">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex min-w-0 flex-col gap-3 @lg:flex-row @lg:items-center @lg:gap-6">
          <div className="min-w-0 @lg:grow">
            <SearchField
              label={t`Szukaj`}
              value={search}
              onChange={setSearch}
            />
          </div>
          <QuestionFilter
            isOn={isOnlyDisagreement}
            onChange={setIsOnlyDisagreement}
          />
        </div>
        <QuestionList
          questions={listed}
          other={comparison.other.orientation}
          openIds={openIds}
          onToggle={toggleQuestion}
        />
      </div>
    </div>
  );
};
