import type { Meta, StoryObj } from "@storybook/react-vite";

import { PromotionBanner } from "./PromotionBanner";
import type { Promotion } from "./PromotionBanner.types";

const activePromotion: Promotion = {
  name: "Dołącz do kampanii myPolitics",
  url: "https://mypolitics.pl",
  date: {
    start: new Date("2026-01-01T00:00:00.000Z"),
    end: new Date("2026-12-31T23:59:59.999Z"),
  },
  content: {
    leftTitle: "Podoba Ci się myPolitics?",
    leftSubtitle: "Twórz to z nami.",
    rightTitle: "Dołącz na Discord",
    rightSubtitle: "Fundacji Generacja Innowacja",
  },
};

const secondActivePromotion: Promotion = {
  name: "Dołącz do społeczności myPolitics",
  url: "https://mypolitics.pl",
  date: {
    start: new Date("2026-01-01T00:00:00.000Z"),
    end: new Date("2026-12-31T23:59:59.999Z"),
  },
  content: {
    leftTitle: "Podoba Ci się myPolitics?",
    leftSubtitle: "Twórz to z nami.",
    rightTitle: "Dołącz na Discord",
    rightSubtitle: "naszej Fundacji",
  },
};

const expiredPromotion: Promotion = {
  ...activePromotion,
  name: "Zakończona kampania myPolitics",
  date: {
    start: new Date("2025-01-01T00:00:00.000Z"),
    end: new Date("2025-12-31T23:59:59.999Z"),
  },
};
const meta = {
  component: PromotionBanner,
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PromotionBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    promotions: [activePromotion],
  },
};

export const ActiveMobile: Story = {
  args: {
    promotions: [activePromotion],
  },
  decorators: [
    (Story) => (
      <div className="w-[375px] max-w-full p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    chromatic: {
      viewports: [375],
    },
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
