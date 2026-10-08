import { useState } from "react";

import { FOCUS_CLASS_NAME } from "@/constants/focus";

import type { PromotionBannerProps } from "./PromotionBanner.types";
import { getCurrentPromotion } from "./utils/getCurrentPromotion";

export const PromotionBanner = ({
  promotions,
  fallback,
}: PromotionBannerProps) => {
  // Picked once, so the banner does not change while the page is open.
  const [activePromotion] = useState(() => getCurrentPromotion(promotions));

  if (activePromotion === null) {
    return fallback ?? null;
  }

  // One picture per width: the two that do not fit the screen are not
  // displayed, so the link has a single image in the accessibility tree.
  // They load lazily, which keeps the browser from downloading those two.
  return (
    <a
      aria-label={activePromotion.name}
      href={activePromotion.url}
      rel="noopener noreferrer"
      target="_blank"
      className={`block w-full overflow-hidden rounded-2xl ${FOCUS_CLASS_NAME}`}
    >
      <img
        src={activePromotion.imageUrl.mobile}
        alt={activePromotion.name}
        title={activePromotion.name}
        loading="lazy"
        className="block h-auto w-full object-cover md:hidden"
      />
      <img
        src={activePromotion.imageUrl.tablet}
        alt={activePromotion.name}
        title={activePromotion.name}
        loading="lazy"
        className="hidden h-auto w-full object-cover md:block lg:hidden"
      />
      <img
        src={activePromotion.imageUrl.desktop}
        alt={activePromotion.name}
        title={activePromotion.name}
        loading="lazy"
        className="hidden h-auto w-full object-cover lg:block"
      />
    </a>
  );
};
