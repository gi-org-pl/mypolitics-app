import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SurveyCategorySelect } from "./SurveyCategorySelect";
import type { SurveyCategory } from "./SurveyCategorySelect.types";

const MOCK_CATEGORIES: SurveyCategory[] = [
  { id: "worldview", name: "Światopogląd" },
  { id: "system", name: "Ustrój" },
  { id: "economy", name: "Gospodarka" },
  { id: "foreign", name: "Polityka zagraniczna" },
  { id: "ecology", name: "Ekologia" },
];

const meta: Meta<typeof SurveyCategorySelect> = {
  title: "Survey/SurveyCategorySelect",
  component: SurveyCategorySelect,
  parameters: {
    layout: "centered",
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(
      args.selectedIds ?? [],
    );
    return (
      <div className="w-80">
        <SurveyCategorySelect
          {...args}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<typeof SurveyCategorySelect>;

export const Default: Story = {
  args: {
    categories: MOCK_CATEGORIES,
    selectedIds: [],
    maxSelection: 3,
  },
};

export const PartiallySelected: Story = {
  args: {
    categories: MOCK_CATEGORIES,
    selectedIds: ["worldview", "economy"],
    maxSelection: 3,
  },
};

export const AtMaxSelection: Story = {
  args: {
    categories: MOCK_CATEGORIES,
    selectedIds: ["worldview", "system", "economy"],
    maxSelection: 3,
  },
};

export const CustomMaxSelection: Story = {
  args: {
    categories: MOCK_CATEGORIES,
    selectedIds: ["worldview"],
    maxSelection: 2,
  },
};

export const CustomPrompt: Story = {
  args: {
    categories: MOCK_CATEGORIES,
    selectedIds: [],
    maxSelection: 3,
    prompt: <span>Wybierz tematy które Cię interesują.</span>,
  },
};

export const LongCategoryName: Story = {
  args: {
    categories: [
      ...MOCK_CATEGORIES.slice(0, 4),
      {
        id: "long",
        name: "Bardzo długa nazwa kategorii która powinna zawijać się do następnej linii",
      },
    ],
    selectedIds: [],
    maxSelection: 3,
  },
};