import type { ReactNode } from "react";

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
