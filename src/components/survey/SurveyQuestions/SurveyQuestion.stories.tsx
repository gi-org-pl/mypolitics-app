import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "storybook/test";
import { SurveyQuestion } from "./SurveyQuestion";

const meta: Meta<typeof SurveyQuestion> = {
  title: "Survey/SurveyQuestion",
  component: SurveyQuestion,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "slate",
      values: [{ name: "slate", value: "#1e293b" }],
    },
  },
  argTypes: {
    question: { control: "text" },
    questionDescription: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SurveyQuestion>;

export const Default: Story = {
  name: "No explanation",
  args: {
    question: "Czy respondent nie powinien unikać odpowiadania na to pytanie?",
  },
};
export const WithExplanationCollapsed1: Story = {
  name: "With explanation  collapsed (With a key word)",
  args: {
    question: "Czy respondent powinien wypełnić wszystkie pola formularza?",
    questionDescription:
      "To oznacza, że każde pole oznaczone gwiazdką (*) jest wymagane i nie może pozostać puste. " +
      "Pominięcie pól obowiązkowych uniemożliwi zapisanie formularza i przejście do kolejnego kroku.",
  },
};

export const WithExplanationCollapsed2: Story = {
  name: "With explanation  collapsed (Without a key word)",
  args: {
    question: "Czy respondent powinien wypełnić wszystkie pola formularza?",
    questionDescription:
      "To oznacza, że każde pole  gwiazdką (*) jest wymagane i nie może pozostać puste. " +
      "Pominięcie pól obowiązkowych uniemożliwi zapisanie formularza i przejście do kolejnego kroku.",
  },
};

export const WithExplanationExpanded: Story = {
  name: "With explanation  expanded",
  args: {
    question: "Czy respondent nie powinien pomijać pytań opcjonalnych?",
    questionDescription:
      "To oznacza, że pytania oznaczone jako opcjonalne mogą być pominięte bez konsekwencji dla wyniku. " +
      "Zachęcamy jednak do odpowiedzi na wszystkie pytania, ponieważ pomaga to w dokładniejszej analizie.",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = await canvas.findByTestId("explanation-toggle");
    await userEvent.click(toggleButton);
  },
};
