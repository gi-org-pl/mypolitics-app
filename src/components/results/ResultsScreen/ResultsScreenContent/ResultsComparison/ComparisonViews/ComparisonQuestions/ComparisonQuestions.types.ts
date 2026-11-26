import type { ComparedQuestion } from "@/types/comparison";

// What narrows the list of questions.
export interface QuestionsFilter {
  search: string; // the text of the search field, as typed
  isOnlyDisagreement: boolean; // whether only the questions the two sides disagree on are listed
}

// The view of the questions: what it shows, and what the taker can do in it.
export interface ComparisonQuestionsControls extends QuestionsFilter {
  listed: ComparedQuestion[]; // the questions that pass the search and the filter, in the order of the quiz
  openIds: string[]; // the questions whose row is open
  setSearch: (search: string) => void;
  setIsOnlyDisagreement: (isOnlyDisagreement: boolean) => void;
  toggleQuestion: (questionId: string) => void; // opens a closed row, closes an open one
}
