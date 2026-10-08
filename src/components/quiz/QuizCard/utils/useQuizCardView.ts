import { useId, useState } from "react";

import { toTrimmedText } from "@/utils/text/toTrimmedText";

import type { QuizCardViewInput } from "../QuizCard.types";
import { getBadgePlacement } from "./getBadgePlacement";
import { toDescription } from "./toDescription";

export const useQuizCardView = ({
  title,
  logoUrl,
  backgroundUrl,
  cta,
  description,
  tags,
  isHighlighted = false,
  isAlwaysExpanded = false,
  isImageHiddenOnWide = false,
  onCardClick,
}: QuizCardViewInput) => {
  const bodyId = useId();
  const [isToggledOpen, setIsToggledOpen] = useState(false);

  const cardTitle = toTrimmedText(title);
  const imageUrl = toTrimmedText(backgroundUrl);
  const hasImage = imageUrl !== undefined;
  const cardDescription = toDescription(description);
  const hasBody = cardDescription !== undefined || tags.length > 0;
  const isAlwaysOpen = isAlwaysExpanded || isHighlighted;

  return {
    bodyId,
    title: cardTitle,
    logoUrl: toTrimmedText(logoUrl),
    imageUrl,
    badge: toTrimmedText(cta),
    badgePlacement: getBadgePlacement(hasImage, isImageHiddenOnWide),
    description: cardDescription,
    hasBody,
    isOpen: isAlwaysOpen || isToggledOpen,
    isCollapsible: hasBody && !isAlwaysOpen,
    // A card that shows no image on a wide screen is open there whatever its
    // state; a card with an image keeps its toggle at every width.
    isOpenOnWideScreen: !hasImage || isImageHiddenOnWide,
    toggle: () => setIsToggledOpen((isOpen) => !isOpen),
    // The card is named by its title: without one there is nothing to name
    // the control with, so the card is not clickable at all.
    onCardClick: cardTitle === undefined ? undefined : onCardClick,
  };
};
