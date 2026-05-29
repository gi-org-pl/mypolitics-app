import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SurveySaturatedProgressBar } from "./SurveySaturatedProgressBar";

const meta: Meta<typeof SurveySaturatedProgressBar> = {
  title: "Survey/SurveySaturatedProgressBar",
  component: SurveySaturatedProgressBar,
};

export default meta;

type Story = StoryObj<typeof SurveySaturatedProgressBar>;

export const Default: Story = {
  args: {
    value: 5,
    maxValue: 10,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    maxValue: 10,
  },
};

export const Full: Story = {
  args: {
    value: 10,
    maxValue: 10,
  },
};

export const LowValue: Story = {
  args: {
    value: 1,
    maxValue: 10,
  },
};

export const Flashing: Story = {
  render: () => {
    const [value, setValue] = useState(1);

    return (
      <div className="flex flex-col gap-4">
        <SurveySaturatedProgressBar value={value} maxValue={10} />
        <button
          type="button"
          onClick={() => setValue((prev) => (prev < 10 ? prev + 1 : 0))}
          className="w-fit px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next step ({value} / 10)
        </button>
      </div>
    );
  },
};
