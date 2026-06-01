import type { StoryObj } from "@storybook/react";
import SurveyNewsletter from "./SurveyNewsletter";
import type SurveyNewsletterProps from "./SurveyNewsletter.types";

const prop: SurveyNewsletterProps = {
  email: "",
  onEmailChange: () => {},
  consent: false,
  onConsentChange: () => {},
};

const propFilled: SurveyNewsletterProps = {
  email: "twoj@mail.com",
  onEmailChange: () => {},
  consent: true,
  onConsentChange: () => {},
};

const meta = {
  title: "Components/SurveyNewsletter",
  component: SurveyNewsletter,
  tags: ["autodocs"],
  args: prop,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default",
};
export const Filled: Story = {
  name: "Filled",
  args: propFilled,
};
