import type { QuizTab } from "../../QuizSection.types";
import { QUIZ_TABS } from "../QuizSectionTabs.constants";

// The tab a value of Athena's Tabs stands for; an unknown value is the first
// tab.
export const toQuizTab = (value: string): QuizTab =>
  QUIZ_TABS.find((tab) => tab.value === value)?.value ?? QUIZ_TABS[0].value;
