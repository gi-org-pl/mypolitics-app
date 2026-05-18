import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import myPoliticsLogo from "@/assets/images/myPolitics_logo.png";
import lata90Background from "@/assets/images/QuizCard_backgrounds/lata-90.png";

import { QuizCard } from "./QuizCard";

const noop = (): void => {};

const meta = {
  title: "Quiz/QuizCard",
  component: QuizCard,
  tags: ["autodocs"],
  args: {
    onButtonClick: noop,
    tags: ["+1.5M osób", "15 min"],
    description: "Quiz description",
  },
} satisfies Meta<typeof QuizCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
  parameters: {
    docs: {
      description: {
        story:
          "Standard card, expanded on desktop (viewport ≥768px): description and tags visible, chevron hidden. Below `md`, use the chevron to expand/collapse.",
      },
    },
  },
  decorators: [
    (Story): ReactElement => (
      <div className="w-full max-w-[960px]">
        <Story />
      </div>
    ),
  ],
  args: {
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    cta: "Kiedyś to było... no właśnie, jak?",
    isAlwaysExpanded: false,
    isMainAction: true,
  },
};

export const Collapsed: Story = {
  name: "Collapsed",
  parameters: {
    docs: {
      description: {
        story:
          "Mobile viewport: card starts collapsed with chevron. Resize the Storybook preview below 768px width. At `md` and up, the card matches desktop (expanded, no chevron).",
      },
    },
  },
  decorators: [
    (Story): ReactElement => (
      <div className="mx-auto w-full max-w-[360px]">
        <Story />
      </div>
    ),
  ],
  args: {
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    isAlwaysExpanded: false,
  },
};

export const WithBackground: Story = {
  name: "WithBackground",
  parameters: {
    docs: {
      description: {
        story:
          "`backgroundUrl` adds a hero image; description and tags are always visible (no chevron).",
      },
    },
  },
  args: {
    backgroundUrl: lata90Background,
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
  },
};

export const WithCTA: Story = {
  name: "WithCTA",
  parameters: {
    docs: {
      description: {
        story: "`cta` + `backgroundUrl`",
      },
    },
  },
  args: {
    backgroundUrl: lata90Background,
    title: "Polskie Lata 90.",
    cta: "Kiedyś to było... no właśnie, jak?",
    description: "Card with hero image and CTA overlay on the image.",
  },
};

export const Highlighted: Story = {
  name: "Highlighted",
  parameters: {
    docs: {
      description: {
        story:
          "`isHighlighted` + `isMainAction` + `isShowStartText`: same ash background as default, primary play button with “Rozpocznij”, always expanded on mobile.",
      },
    },
  },
  args: {
    isHighlighted: true,
    isMainAction: true,
    isShowStartText: true,
    cta: "Nowy Quiz Tożsamościowy!",
    title: "Polskie Lata 90.",
    logoHeight: 24,
    description: "Featured quiz card with primary start action.",
  },
};

export const TitleLogo: Story = {
  name: "TitleLogo",
  parameters: {
    docs: {
      description: {
        story:
          "No `logoUrl`: `title` is rendered as the text logo in the header row.",
      },
    },
  },
  args: {
    title: "Generacja Innowacja",
    description: "Title-only logo row (no image).",
  },
};

export const Loading: Story = {
  name: "Loading",
  args: {
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    isButtonLoading: true,
  },
};

export const DisabledButton: Story = {
  name: "DisabledButton",
  args: {
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    isButtonDisabled: true,
  },
};
