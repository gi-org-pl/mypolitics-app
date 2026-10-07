import type { QuizTab } from "../QuizSection.types";

export interface QuizSectionTabsProps {
  activeTab: QuizTab;
  onTabChange: (tab: QuizTab) => void;
}
