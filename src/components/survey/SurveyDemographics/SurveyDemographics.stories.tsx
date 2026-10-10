import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, within } from "storybook/test";

import { SurveyDemographics } from "./SurveyDemographics";
import type { SurveyDemographicsProps } from "./SurveyDemographics.types";

const options: SurveyDemographicsProps["options"] = {
  age: [
    { value: "under_18", label: "Mniej niż 18" },
    { value: "18_24", label: "18–24" },
    { value: "25_34", label: "25–34" },
    { value: "35_49", label: "35–49" },
    { value: "50_64", label: "50–64" },
    { value: "65_plus", label: "65 i więcej" },
  ],
  gender: [
    { value: "male", label: "Mężczyzna" },
    { value: "female", label: "Kobieta" },
    { value: "other", label: "Inna płeć" },
  ],
  residenceAreaSize: [
    { value: "village", label: "Wieś" },
    {
      value: "city_below_50k",
      label: "Miasto poniżej 50 tysięcy mieszkańców",
    },
    {
      value: "city_below_200k",
      label: "Miasto poniżej 200 tysięcy mieszkańców",
    },
    {
      value: "city_below_500k",
      label: "Miasto poniżej 500 tysięcy mieszkańców",
    },
    {
      value: "city_over_500k",
      label: "Miasto powyżej 500 tysięcy mieszkańców",
    },
  ],
  education: [
    { value: "primary", label: "Wykształcenie podstawowe" },
    { value: "basic_vocational", label: "Wykształcenie zasadnicze zawodowe" },
    { value: "secondary", label: "Wykształcenie średnie" },
    { value: "higher", label: "Wykształcenie wyższe" },
  ],
};

const meta = {
  title: "Survey/SurveyDemographics",
  component: SurveyDemographics,
  args: {
    options,
    values: {},
    onChange: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<SurveyDemographicsProps>();

    return (
      <SurveyDemographics
        {...args}
        onChange={(values) => {
          args.onChange(values);
          updateArgs({ values });
        }}
      />
    );
  },
} satisfies Meta<typeof SurveyDemographics>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    values: {
      age: "25_34",
      gender: "female",
      residenceAreaSize: "village",
      education: "higher",
    },
  },
};

export const DialogOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "To znaczy?" }));

    await expect(
      within(canvasElement.ownerDocument.body).getByRole("dialog", {
        name: "Zakres wykorzystania danych",
      }),
    ).toBeVisible();
  },
};

export const DialogInTransformedAncestor: Story = {
  ...DialogOpen,
  decorators: [
    (Story) => (
      <div style={{ transform: "scale(1)" }}>
        <Story />
      </div>
    ),
  ],
};

export const PartlyFilled: Story = {
  args: {
    values: {
      age: "18_24",
      education: "secondary",
    },
  },
};

export const Disabled: Story = {
  args: {
    values: {
      age: "25_34",
      gender: "male",
    },
    isDisabled: true,
  },
};

export const LongOptionLabel: Story = {
  args: {
    options: {
      ...options,
      gender: [
        ...options.gender,
        {
          value: "undisclosed",
          label: "Wolę nie podawać tej informacji w tym quizie",
        },
      ],
      education: [
        ...options.education,
        {
          value: "postgraduate",
          label:
            "Wykształcenie wyższe ze stopniem naukowym doktora lub doktora habilitowanego nauk społecznych",
        },
      ],
    },
    values: {
      gender: "undisclosed",
      residenceAreaSize: "city_below_200k",
      education: "postgraduate",
    },
  },
};

export const EmptyOptionList: Story = {
  args: {
    options: {
      ...options,
      residenceAreaSize: [],
    },
  },
};

export const UnknownValue: Story = {
  args: {
    values: {
      age: "25_34",
      gender: "not_on_the_list",
    },
  },
};
