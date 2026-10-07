import type { QuizCardLogoHeight } from "../QuizCard.types";

export interface QuizCardHeaderProps {
  title?: string;
  logoUrl?: string;
  logoHeight: QuizCardLogoHeight;
  bodyId: string;
  isOpen: boolean;
  isCollapsible: boolean;
  isOpenOnWideScreen: boolean;
  isShowStartText: boolean;
  isButtonLoading: boolean;
  isButtonDisabled: boolean;
  onToggle: () => void;
  onButtonClick: () => void;
  onCardClick?: () => void;
}
