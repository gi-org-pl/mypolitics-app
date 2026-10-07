import { Tabs } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import { QUIZ_TABS, TABS_CLASS_NAME } from "./QuizSectionTabs.constants";
import type { QuizSectionTabsProps } from "./QuizSectionTabs.types";
import { toQuizTab } from "./utils/toQuizTab";

export const QuizSectionTabs = ({
  activeTab,
  onTabChange,
}: QuizSectionTabsProps) => {
  const { i18n, t } = useLingui();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(toQuizTab(value))}
      items={QUIZ_TABS.map(({ value, label }) => ({
        value,
        label: i18n._(label),
      }))}
      aria-label={t`Rodzaje quizów`}
      className={TABS_CLASS_NAME}
    />
  );
};
