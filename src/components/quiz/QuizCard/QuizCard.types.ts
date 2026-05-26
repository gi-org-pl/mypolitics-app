import type { ReactNode } from "react";

export interface QuizCardProps {
  title?: string;
  logoUrl?: string;
  logoHeight?: 24 | 32;
  backgroundUrl?: string;
  cta?: string;
  description: string | ReactNode;
  tags: string[];
  isHighlighted?: boolean;
  isAlwaysExpanded?: boolean;
  isShowStartText?: boolean;
  isMainAction?: boolean;
  isButtonLoading?: boolean;
  isButtonDisabled?: boolean;
  onButtonClick: () => void;
  onCardClick?: () => void;
}