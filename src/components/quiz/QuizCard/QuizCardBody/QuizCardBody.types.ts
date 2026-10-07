import type { ReactNode } from "react";

export interface QuizCardBodyProps {
  id: string;
  description: ReactNode;
  tags: string[];
  isOpen: boolean;
  isOpenOnWideScreen: boolean;
  isHighlighted: boolean;
}
