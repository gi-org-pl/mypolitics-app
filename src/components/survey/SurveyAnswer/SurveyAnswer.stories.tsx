import type { Meta, StoryObj } from "@storybook/react";
import { SurveyAnswer } from "./SurveyAnswer";

const meta: Meta<typeof SurveyAnswer> = {
  title: "Survey/SurveyAnswer",
  component: SurveyAnswer,
  args: {
    onClick: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof SurveyAnswer>;

export const StronglyAgree: Story = {
  args: {
    type: "strongly-agree",
    title: "Zdecydowanie się zgadzam",
  },
};

export const Agree: Story = {
  args: {
    type: "agree",
    title: "Zgadzam się",
  },
};

export const Disagree: Story = {
  args: {
    type: "disagree",
    title: "Nie zgadzam się",
  },
};

export const StronglyDisagree: Story = {
  args: {
    type: "strongly-disagree",
    title: "Zdecydowanie się nie zgadzam",
  },
};

export const Custom: Story = {
  args: {
    type: "custom",
    title: "Odpowiedź niestandardowa",
  },
};

export const CustomSelectableUnselected: Story = {
  args: {
    type: "custom-selectable",
    isSelected: false,
    title: "Odpowiedź możliwa do wybrania",
  },
};

export const CustomSelectableSelected: Story = {
  args: {
    type: "custom-selectable",
    isSelected: true,
    title: "Odpowiedź możliwa do wybrania",
  },
};

export const DisabledStronglyAgree: Story = {
  args: {
    type: "strongly-agree",
    isDisabled: true,
    title: "Zdecydowanie się zgadzam",
  },
};

export const DisabledCustomSelectable: Story = {
  args: {
    type: "custom-selectable",
    isDisabled: true,
    isSelected: false,
    title: "Odpowiedź możliwa do wybrania",
  },
};
