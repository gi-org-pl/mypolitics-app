import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import type { Orientation } from "@/types/orientation";

import { ResultsHeader } from "./ResultsHeader";

const imageUrl = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 55"><rect width="55" height="55" fill="#dcdfe3"/><rect x="18.5" y="18.5" width="18" height="18" fill="none" stroke="white" stroke-width="2"/><path d="M18.5 18.5l18 18M36.5 18.5l-18 18" stroke="white" stroke-width="2"/></svg>',
)}`;

const orientation: Orientation = {
  id: "orientation",
  type: "ideology",
  name: "Orientation Name",
  imageUrl,
};

const narrow = { viewport: { value: "iphone6" } };

const meta = {
  title: "Results/ResultsHeader",
  component: ResultsHeader,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    orientation,
    confidence: 75,
    activeTab: "results",
    onTabChange: fn(),
  },
} satisfies Meta<typeof ResultsHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  globals: narrow,
};

export const WithExtras: Story = {
  globals: narrow,
  args: {
    slogan: "Slogan",
    link: { url: "https://example.org", label: "Link Name" },
  },
};

export const NoMatch: Story = {
  globals: narrow,
  args: {
    orientation: undefined,
    confidence: undefined,
  },
};

export const Desktop: Story = {
  args: {
    slogan: "Slogan",
    link: { url: "https://example.org", label: "Link Name" },
  },
};

export const PartialMatch: Story = {
  args: {
    confidence: 75,
  },
};

export const Match: Story = {
  args: {
    confidence: 80,
  },
};

export const JustBelowPartial: Story = {
  args: {
    confidence: 49,
    slogan: "Slogan",
    link: { url: "https://example.org", label: "Link Name" },
  },
};

export const SloganOnly: Story = {
  args: {
    slogan: "Slogan",
  },
};

export const LinkOnly: Story = {
  args: {
    link: { url: "https://example.org", label: "Link Name" },
  },
};

export const InvalidLink: Story = {
  args: {
    slogan: "Slogan",
    link: { url: "javascript:alert(1)", label: "Link Name" },
  },
};

export const LinkWithoutLabel: Story = {
  args: {
    link: { url: "https://example.org/program" },
  },
};

export const LongName: Story = {
  globals: narrow,
  args: {
    orientation: {
      ...orientation,
      name: "Socjaldemokratyczny liberalizm instytucjonalny o bardzo długiej autorskiej nazwie, która nie mieści się w dwóch liniach",
    },
  },
};

export const LongSlogan: Story = {
  globals: narrow,
  args: {
    slogan:
      "Wolność, równość\ni solidarność dla każdego, kto chce budować wspólną przyszłość",
    link: {
      url: "https://example.org",
      label: "Przeczytaj cały program tej orientacji na stronie autora",
    },
  },
};

export const NoImage: Story = {
  args: {
    orientation: { ...orientation, imageUrl: undefined },
  },
};

export const ComparisonTabActive: Story = {
  args: {
    activeTab: "comparison",
  },
};
