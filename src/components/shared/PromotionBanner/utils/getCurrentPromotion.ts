import type { Promotion } from "../PromotionBanner.types";

// One of the promotions that run today, picked at random; null when none
// does.
export const getCurrentPromotion = (
  promotions: Promotion[],
): Promotion | null => {
  const now = new Date();
  const activePromotions = promotions.filter(
    (promotion) => now >= promotion.date.start && now <= promotion.date.end,
  );

  if (activePromotions.length === 0) {
    return null;
  }

  return activePromotions[Math.floor(Math.random() * activePromotions.length)];
};
