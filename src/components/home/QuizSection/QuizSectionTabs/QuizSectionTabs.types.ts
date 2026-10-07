import type { MessageDescriptor } from "@lingui/core";

import type { QuizTab } from "../QuizSection.types";

export interface QuizTabOption {
  value: QuizTab;
  label: MessageDescriptor;
}

export interface QuizSectionTabsProps {
  activeTab: QuizTab;
  onTabChange: (tab: QuizTab) => void;
}
