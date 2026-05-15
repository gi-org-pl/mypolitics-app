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
    >
      <div className="flex w-full flex-col gap-4 rounded-2xl bg-banner-gradient px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold text-white">
            {activePromotion.content.leftTitle}
          </p>
          <p className="font-bold text-gi-secondary">
            {activePromotion.content.leftSubtitle}
          </p>
        </div>
        <hr className="border-white/20 md:hidden" />
        <div className="md:text-right">
          <p className="font-bold text-white">
            {activePromotion.content.rightTitle}
          </p>
          <p className="font-bold text-gi-red">
            {activePromotion.content.rightSubtitle}
          </p>
        </div>
      </div>
    </a>
  );
};
