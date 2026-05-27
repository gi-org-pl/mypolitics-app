import { useState } from "react";

import type { Promotion, PromotionBannerProps } from "./PromotionBanner.types";

const getCurrentPromotion = (promotions: Promotion[]): Promotion | null => {
  const now = new Date();
  const activePromotions = promotions.filter(
      (promotion) => now >= promotion.date.start && now <= promotion.date.end,
  );

  if (activePromotions.length === 0) {
    return null;
  }

  return activePromotions[Math.floor(Math.random() * activePromotions.length)];
};

export const PromotionBanner = ({
                                  promotions,
                                  fallback,
                                }: PromotionBannerProps) => {
  const [activePromotion] = useState<Promotion | null>(() =>
      getCurrentPromotion(promotions),
  );

  if (activePromotion === null) {
    return fallback ?? null;
  }

  return (
      <a
          aria-label={activePromotion.name}
          href={activePromotion.url}
          rel="noopener noreferrer"
          target="_blank"
          className="w-full"
      >
        <div className="relative w-full overflow-hidden rounded-2xl">
          <img
              src={activePromotion.imageUrl.mobile}
              alt={activePromotion.name}
              title={activePromotion.name}
              className="block w-full h-auto object-cover md:hidden"
          />
          <img
              src={activePromotion.imageUrl.tablet}
              alt={activePromotion.name}
              title={activePromotion.name}
              className="hidden w-full h-auto object-cover md:block lg:hidden"
          />
          <img
              src={activePromotion.imageUrl.desktop}
              alt={activePromotion.name}
              title={activePromotion.name}
              className="hidden w-full h-auto object-cover lg:block"
          />
        </div>
      </a>
  );
};
