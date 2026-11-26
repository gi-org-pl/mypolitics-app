import type { Meta, StoryObj } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { resolvedModules } from "@/utils/result-modules/resolvedModules.fixtures";

import { ResultsColumns } from "./ResultsColumns";
import { MODULES_COMPARISON } from "./ResultsColumns.fixtures";

// The modules of a result as the sheet of the result screen lays them out.
// The two columns follow the width of that sheet, so alone - with no sheet
// around them - the modules stand in one column at any width; the stories of
// the result screen show both columns.
const meta = {
  title: "Results/ResultsColumns",
  component: ResultsColumns,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    modules: resolvedModules,
  },
} satisfies Meta<typeof ResultsColumns>;

export default meta;

type Story = StoryObj<typeof meta>;

// One module of every type.
export const EveryModuleType: Story = {};

// The same modules with a friend laid over each of them.
export const WithComparison: Story = {
  args: { comparison: MODULES_COMPARISON },
};

// A friend whose result draws no archetype: that module is drawn for the
// taker alone.
export const ComparisonMissingModule: Story = {
  args: {
    comparison: {
      ...MODULES_COMPARISON,
      modules: MODULES_COMPARISON.modules.filter(
        ({ type }) => type !== "archetype",
      ),
    },
  },
};

export const Narrow: Story = {
  args: { comparison: MODULES_COMPARISON },
  globals: { viewport: { value: "iphone5" } },
};
