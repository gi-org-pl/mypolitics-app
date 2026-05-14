import type { ReactNode } from "react";

export type QuizCardLogoHeight = 24 | 32;

export interface QuizCardProps {
  title?: string; // §6 title-only logo: styled in the logo row when `logoUrl` is omitted (e.g. "Polskie Lata 90.")
  logoUrl?: string; // quiz logo image
  logoHeight?: QuizCardLogoHeight; // logo height in px, default: 32
  backgroundUrl?: string; // optional hero; when set, card stays expanded (no chevron) on all viewports
  cta?: string; // optional badge label (e.g. "Nowy Quiz Tożsamościowy!")
  description: string | ReactNode; // main body text (may contain bold spans)
  tags: string[]; // info chips, e.g. ["+1.5M osób", "15 min"]
  isHighlighted?: boolean; // dark teal featured card; always expanded, no chevron; CTA strip at top when `cta` is set
  isAlwaysExpanded?: boolean; // never collapses, no chevron, default: false
  isShowStartText?: boolean; // show "Rozpocznij" label next to play icon, default: false
  isMainAction?: boolean; // play button uses primary filled style, default: false
  isButtonLoading?: boolean; // §7: spinner replaces play icon; card stays interactive (no disabled overlay)
  isButtonDisabled?: boolean; // §8: play button not rendered at all when true
  onButtonClick: () => void; // play / start button handler
  onCardClick?: () => void; // entire card click handler (optional)
}
