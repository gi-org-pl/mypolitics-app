import { useState } from "react";

import { DEFAULT_QUIZ_TAB } from "./QuizSection.constants";
import type { QuizSectionProps, QuizTab } from "./QuizSection.types";
import { QuizSectionActions } from "./QuizSectionActions/QuizSectionActions";
import { QuizSectionList } from "./QuizSectionList/QuizSectionList";
import { QuizSectionTabs } from "./QuizSectionTabs/QuizSectionTabs";
import { getTabPanelIdentity } from "./utils/getTabPanelIdentity";
import { getVisibleQuizzes } from "./utils/getVisibleQuizzes";

export const QuizSection = ({
  quizzes,
  onQuizStart,
  onShowMore,
  onCreate,
}: QuizSectionProps) => {
  const [activeTab, setActiveTab] = useState<QuizTab>(DEFAULT_QUIZ_TAB);

  return (
    <div className="flex w-full flex-col gap-2 md:gap-5">
      <QuizSectionTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <QuizSectionList
        panel={getTabPanelIdentity(activeTab)}
        quizzes={getVisibleQuizzes(quizzes, activeTab)}
        onQuizStart={onQuizStart}
      />

      <QuizSectionActions onShowMore={onShowMore} onCreate={onCreate} />
    </div>
  );
};
