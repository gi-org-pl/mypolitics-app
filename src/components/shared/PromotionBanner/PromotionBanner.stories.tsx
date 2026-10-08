import type { Meta, StoryObj } from "@storybook/react-vite";

import bannerDesktop from "@/assets/images/promotions/banner-desktop.png";
import bannerMobile from "@/assets/images/promotions/banner-mobile.png";
import bannerTablet from "@/assets/images/promotions/banner-tablet.png";

import { PromotionBanner } from "./PromotionBanner";
import type { Promotion } from "./PromotionBanner.types";

const activePromotion: Promotion = {
  name: "Dołącz do kampanii myPolitics",
  url: "https://mypolitics.pl",
  date: {
    start: new Date("2024-01-01T00:00:00.000Z"),
    end: new Date("2099-12-31T23:59:59.999Z"),
  },
  imageUrl: {
    mobile: bannerMobile,
    tablet: bannerTablet,
    desktop: bannerDesktop,
  },
};

const secondActivePromotion: Promotion = {
  ...activePromotion,
  name: "Dołącz do społeczności myPolitics",
};

const expiredPromotion: Promotion = {
  ...activePromotion,
  name: "Zakończona kampania myPolitics",
  date: {
    start: new Date("2023-01-01T00:00:00.000Z"),
    end: new Date("2023-12-31T23:59:59.999Z"),
  },
};

const meta = {
  title: "Shared/PromotionBanner",
  component: PromotionBanner,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PromotionBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    promotions: [activePromotion],
  },
};

export const MultipleActive: Story = {
  args: {
    promotions: [activePromotion, secondActivePromotion],
  },
};

export const NoActiveWithFallback: Story = {
  args: {
    fallback: <span>Brak aktywnej promocji</span>,
    promotions: [expiredPromotion],
  },
};

export const NoActiveNoFallback: Story = {
  args: {
    promotions: [expiredPromotion],
  },
};
