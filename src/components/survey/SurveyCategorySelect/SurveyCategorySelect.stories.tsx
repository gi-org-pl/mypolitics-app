import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { SurveyCategorySelect } from "./SurveyCategorySelect";
import type {
  SurveyCategory,
  SurveyCategorySelectProps,
} from "./SurveyCategorySelect.types";

const CATEGORIES: SurveyCategory[] = [
  { id: "worldview", name: "Światopogląd" },
  { id: "system", name: "Ustrój" },
  { id: "economy", name: "Gospodarka" },
  { id: "foreign", name: "Polityka zagraniczna" },
  { id: "ecology", name: "Ekologia" },
];

const LONG_NAME =
  "Polityka społeczna, mieszkaniowa i senioralna oraz ochrona zdrowia psychicznego";

const narrow = { viewport: { value: "iphone5" } };

const meta = {
  title: "Survey/SurveyCategorySelect",
  component: SurveyCategorySelect,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    categories: CATEGORIES,
    selectedIds: [],
    onChange: () => {},
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<SurveyCategorySelectProps>();

    return (
      <SurveyCategorySelect
        {...args}
        onChange={(selectedIds) => updateArgs({ selectedIds })}
      />
    );
  },
} satisfies Meta<typeof SurveyCategorySelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PartiallySelected: Story = {
  args: {
    selectedIds: ["worldview", "economy"],
    maxSelection: 3,
  },
};

export const AtMaxSelection: Story = {
  args: {
    selectedIds: ["system", "economy", "ecology"],
    maxSelection: 3,
  },
};

export const CustomMaxSelection: Story = {
  args: {
    selectedIds: ["worldview"],
    maxSelection: 2,
  },
};

export const SingleSelection: Story = {
  args: {
    maxSelection: 1,
  },
};

export const ManySelection: Story = {
  args: {
    maxSelection: 5,
  },
};

export const CustomPrompt: Story = {
  args: {
    prompt: "Wybierz tematy, które Cię interesują.",
  },
};

export const LongCategoryName: Story = {
  args: {
    categories: [
      ...CATEGORIES.slice(0, 2),
      { id: "long", name: LONG_NAME },
      { id: "long-selected", name: LONG_NAME },
    ],
    selectedIds: ["long-selected"],
  },
  globals: narrow,
};

export const NoCategories: Story = {
  args: {
    categories: [],
  },
};
