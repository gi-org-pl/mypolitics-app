import type { Decorator, Meta, StoryObj } from "@storybook/react";
import "@/index.css";
import { ResultsHeader } from "./ResultsHeader";

const compactDecorator: Decorator = (Story) => (
  <div className="w-[388px] max-w-full">
    <Story />
  </div>
);

const wideDecorator: Decorator = (Story) => (
  <div className="w-[784px] max-w-full">
    <Story />
  </div>
);

const meta: Meta<typeof ResultsHeader> = {
  title: "results/ResultsHeader",
  component: ResultsHeader,
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof ResultsHeader>;

const avatarUrl = "https://api.dicebear.com/9.x/personas/svg?seed=result";

const mobileViewport = {
  viewport: {
    defaultViewport: "mobile1",
  },
};

const baseArgs = {
  name: "Nazwa Tożsamości",
  slogan: "Hasło Tożsamości",
  imageUrl: avatarUrl,
};

export const HighMatch: Story = {
  decorators: [compactDecorator],
  parameters: mobileViewport,
  args: {
    name: "Zielony postępowiec",
    slogan: "Razem w stronę zielonego świata!",
    imageUrl: avatarUrl,
    agreementPercent: 76,
  },
};

export const MidMatch: Story = {
  decorators: [compactDecorator],
  parameters: mobileViewport,
  args: {
    ...baseArgs,
    agreementPercent: 51,
  },
};

export const LowMatch: Story = {
  decorators: [compactDecorator],
  parameters: mobileViewport,
  args: {
    ...baseArgs,
    agreementPercent: 12,
  },
};

export const WithButton: Story = {
  decorators: [wideDecorator],
  args: {
    name: "Uniwersalna nazwa wyniku",
    slogan: "Tutaj hasło z jasnym wynikiem",
    imageUrl: avatarUrl,
    agreementPercent: 75,
    actionLabel: "Program wyborczy",
    actionShortLabel: "Program",
    onActionClick: () => undefined,
  },
};

export const WithoutButton: Story = {
  decorators: [compactDecorator],
  parameters: mobileViewport,
  args: {
    ...baseArgs,
    agreementPercent: 76,
  },
};

export const FractionalPercent: Story = {
  decorators: [compactDecorator],
  parameters: mobileViewport,
  args: {
    ...baseArgs,
    agreementPercent: 66.6,
  },
};

export const LongName: Story = {
  decorators: [wideDecorator],
  args: {
    name: "Długa, uniwersalna nazwa wyniku, która powinna być zawijana bez przerywania układu",
    slogan:
      "Dłuższe hasło sprawdzające zachowanie dolnego paska, gdy tekst potrzebuje więcej miejsca",
    imageUrl: avatarUrl,
    agreementPercent: 76,
    actionLabel: "Program wyborczy",
    actionShortLabel: "Program",
    onActionClick: () => undefined,
  },
};
