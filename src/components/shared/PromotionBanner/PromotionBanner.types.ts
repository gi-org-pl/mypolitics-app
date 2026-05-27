import type { ReactNode } from "react";

/**
 * All string values in Promotion must be translated at the call site.
 * PromotionBanner does not apply any Lingui macros internally.
 */
export interface Promotion {
  name: string;
  url: string;
  date: {
    start: Date;
    end: Date;
  };
  imageUrl: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface PromotionBannerProps {
  promotions: Promotion[];
  fallback?: ReactNode;
}
