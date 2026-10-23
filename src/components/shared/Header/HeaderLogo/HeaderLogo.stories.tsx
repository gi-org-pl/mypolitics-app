import type { Meta, StoryObj } from "@storybook/react-vite";

import { HeaderLogo } from "./HeaderLogo";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const meta: Meta<typeof HeaderLogo> = {
  title: "Shared/Header/HeaderLogo",
  component: HeaderLogo,
  argTypes: {
    playId: {
      control: "text",
      description: "A new value plays the animation once",
    },
  },
};

export default meta;

type Story = StoryObj<typeof HeaderLogo>;

// The blue logo, as on every later visit of a view.
export const AtRest: Story = {};

// The animation of a first visit. Change `playId` to play it again.
export const Playing: Story = {
  args: {
    playId: "first-visit",
  },
};

// A first visit for a person who asked the system for less movement: the
// blue logo, nothing moves.
export const ReducedMotion: Story = {
  args: {
    playId: "first-visit",
  },
  beforeEach: () => {
    const { matchMedia } = window;

    window.matchMedia = (query: string) => {
      const list = matchMedia.call(window, query);

      return query === REDUCED_MOTION_QUERY
        ? Object.create(list, { matches: { value: true } })
        : list;
    };

    return () => {
      window.matchMedia = matchMedia;
    };
  },
};
