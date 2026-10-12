import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedHeight } from "./AnimatedHeight";

// The content changes its own height when its summary is pressed: the box
// around it then moves to the new height instead of jumping.
const shortContent = (
  <details>
    <summary className="cursor-pointer text-sm font-bold text-gi-primary">
      Pokaż wyjaśnienie
    </summary>
    <p className="text-sm text-gi-primary">
      Obraza uczuć religijnych to publiczne znieważenie przedmiotu czci
      religijnej lub miejsca przeznaczonego do wykonywania obrzędów.
    </p>
  </details>
);

const longContent = (
  <details>
    <summary className="cursor-pointer text-sm font-bold text-gi-primary">
      Pokaż długie wyjaśnienie
    </summary>
    <p className="text-sm wrap-break-word text-gi-primary">
      Obraza uczuć religijnych to publiczne znieważenie przedmiotu czci
      religijnej lub miejsca przeznaczonego do wykonywania obrzędów. W Polsce
      grozi za nią grzywna, ograniczenie wolności albo do dwóch lat więzienia.
      Zwolennicy zniesienia kary wskazują na wolność słowa, przeciwnicy - na
      ochronę osób wierzących przed poniżaniem. Spór dotyczy też tego, kto
      miałby oceniać, czy do obrazy doszło, i czy przepis nie jest stosowany
      wybiórczo.
    </p>
  </details>
);

const meta = {
  title: "Shared/AnimatedHeight",
  component: AnimatedHeight,
  args: {
    children: shortContent,
  },
} satisfies Meta<typeof AnimatedHeight>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
  args: {
    children: longContent,
  },
};

export const Slow: Story = {
  args: {
    durationMs: 1000,
    children: longContent,
  },
};
