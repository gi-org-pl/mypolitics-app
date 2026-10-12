export interface QuestionActions {
  answer: (answerId: string) => void;
  skip: () => void;
}
