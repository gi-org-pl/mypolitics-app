// Runs a step that may throw, and answers with the fallback when it does.
export const safely = <Result>(run: () => Result, fallback: Result): Result => {
  try {
    return run();
  } catch {
    return fallback;
  }
};
