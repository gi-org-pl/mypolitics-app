import type { ReactNode } from "react";

export interface QuizCardProps {
  title?: string;                  // text logo fallback when no logoUrl
  logoUrl?: string;                // quiz logo image
  logoHeight?: 24 | 32;           // logo height in px, default: 32
  backgroundUrl?: string;          // optional hero image at the top of the card
  cta?: string;                    // optional badge label (e.g. "Nowy Quiz Tożsamościowy!")
  description: string | ReactNode; // main body text (may contain bold spans)
  tags: string[];                  // info chips, e.g. ["+1.5M osób", "15 min"]
  isHighlighted?: boolean;         // dark-background featured variant, default: false
  isAlwaysExpanded?: boolean;      // never collapses, no chevron, default: false
  isShowStartText?: boolean;       // show "Rozpocznij" label next to play icon, default: false
  isMainAction?: boolean;          // play button uses primary filled style, default: false
  isButtonLoading?: boolean;       // play button shows spinner instead of icon
  isButtonDisabled?: boolean;      // hides the play button entirely
  onButtonClick: () => void;       // play / start button handler
  onCardClick?: () => void;        // entire card click handler (optional)
}