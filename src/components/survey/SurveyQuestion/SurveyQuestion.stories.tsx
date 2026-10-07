import type { Meta, StoryObj } from "@storybook/react-vite";
import { fireEvent, within } from "storybook/test";

import { SurveyQuestion } from "./SurveyQuestion";

const QUESTION = "Obraza uczuć religijnych nie powinna być karalna.";

const EXPLANATION =
  "Obraza uczuć religijnych to działanie lub wypowiedź, które w opinii osób wierzących znieważają ich wiarę, symbole religijne lub praktyki, takie jak np. drwina z religii, świętych czy miejsc kultu.";

const LONG_EXPLANATION = [
  "Konkordat to umowa międzynarodowa zawierana między państwem a Stolicą Apostolską, która reguluje położenie Kościoła katolickiego w danym kraju.",
  "W Polsce obowiązuje konkordat podpisany w 1993 roku i ratyfikowany w 1998 roku. Określa on między innymi zasady nauczania religii w szkołach publicznych, skutki cywilne małżeństw wyznaniowych, status prawny kościelnych osób prawnych oraz zasady finansowania uczelni katolickich.",
  "Zwolennicy jego utrzymania wskazują na stabilność relacji państwa z Kościołem, a przeciwnicy na nierówne traktowanie innych wyznań i osób niewierzących.",
].join(" ");

const meta: Meta<typeof SurveyQuestion> = {
  title: "Survey/SurveyQuestion",
  component: SurveyQuestion,
  args: {
    question: QUESTION,
    explanation: EXPLANATION,
  },
};

export default meta;
type Story = StoryObj<typeof SurveyQuestion>;

const openExplanation: Story["play"] = async ({ canvasElement }) => {
  await fireEvent.click(within(canvasElement).getByRole("button"));
};

export const WithExplanation: Story = {};

export const ExplanationFallback: Story = {
  args: {
    explanation:
      "Działanie lub wypowiedź, które w opinii osób wierzących znieważają ich wiarę, symbole religijne lub praktyki.",
  },
};

export const NoExplanation: Story = {
  args: {
    question:
      "Kościół katolicki powinien utrzymać uprzywilejowaną pozycję regulowaną konkordatem.",
    explanation: undefined,
  },
};

export const ExplanationOpen: Story = {
  play: openExplanation,
};

export const LongStatement: Story = {
  args: {
    question:
      "Państwo nie powinno finansować z budżetu lekcji religii w szkołach publicznych, wynagrodzeń katechetów ani uczelni wyznaniowych, a Kościół katolicki nie powinien korzystać z ulg podatkowych i celnych, których nie mają inne związki wyznaniowe i organizacje pozarządowe.",
  },
};

export const LongExplanation: Story = {
  args: {
    question:
      "Kościół katolicki powinien utrzymać uprzywilejowaną pozycję regulowaną konkordatem.",
    explanation: LONG_EXPLANATION,
  },
  play: openExplanation,
};

export const LongPreview: Story = {
  args: {
    explanation:
      "Działanie lub wypowiedź, które w opinii osób wierzących znieważają ich wiarę, symbole religijne lub praktyki, to właśnie obraza uczuć religijnych.",
  },
};

export const PhraseInsideWord: Story = {
  args: {
    question:
      "Niepodległość państwa jest ważniejsza niż korzyści z integracji europejskiej, a niektórzy politycy o tym zapominają.",
    explanation: undefined,
  },
};
