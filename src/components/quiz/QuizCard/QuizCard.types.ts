import type { ReactNode } from "react";

export type QuizCardLogoHeight = 24 | 32;

export interface QuizCardProps {
  title?: string;
  logoUrl?: string;
  logoHeight?: QuizCardLogoHeight;
  backgroundUrl?: string;
  cta?: string;
  description: ReactNode;
  tags: string[];
  isHighlighted?: boolean;
  isAlwaysExpanded?: boolean;
  isShowStartText?: boolean;
  isButtonLoading?: boolean;
  isButtonDisabled?: boolean;
  onButtonClick: () => void;
  onCardClick?: () => void;
}

export type QuizCardViewInput = Pick<
  QuizCardProps,
  | "title"
  | "logoUrl"
  | "backgroundUrl"
  | "cta"
  | "description"
  | "tags"
  | "isHighlighted"
  | "isAlwaysExpanded"
  | "onCardClick"
>;
