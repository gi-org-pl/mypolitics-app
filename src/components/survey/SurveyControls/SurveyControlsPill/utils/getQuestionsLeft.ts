export const getQuestionsLeft = (questionsLeft?: number): number | undefined =>
  typeof questionsLeft === "number" && Number.isFinite(questionsLeft)
    ? Math.max(0, Math.floor(questionsLeft))
    : undefined;
