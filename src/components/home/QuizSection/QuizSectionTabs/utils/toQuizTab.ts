import { DEFAULT_QUIZ_TAB, QUIZ_TABS } from "../../QuizSection.constants";
import type { QuizTab } from "../../QuizSection.types";

// The tab a value of Athena's Tabs stands for; an unknown value is the
// default tab.
export const toQuizTab = (value: string): QuizTab =>
  QUIZ_TABS.find((tab) => tab.value === value)?.value ?? DEFAULT_QUIZ_TAB;
