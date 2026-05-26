export type HeaderNavItem = {
  key: "debates" | "polls" | "quizzes";
  label: "Debaty" | "Sondaże" | "Quizy";
  path: string;
  external?: boolean;
};

export type HeaderStoryProps = {
  initialPath: string;
};
