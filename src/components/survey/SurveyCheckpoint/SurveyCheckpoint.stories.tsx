import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { SurveyCheckpoint } from "./SurveyCheckpoint";

// The frame of a checkpoint card, with plain stand-ins for what a card puts
// into it: a number as the visual and plain buttons as the options. The real
// visuals and options are the cards' own, and each card has its own stories.
const NUMBER_CLASS_NAME = "text-5xl leading-none font-bold text-gi-primary";
const OPTION_CLASS_NAME =
  "flex h-12 w-full items-center rounded-full border border-gi-dark-ash px-4 text-left text-base font-bold text-gi-primary";

const AXIS_OPTIONS = ["Interwencjonizm", "Wolny rynek"];
const POSITION_OPTIONS = [
  "Zielony postępowiec",
  "Narodowy konserwatysta",
  "Suwerenny patriota",
];

const meta = {
  title: "Survey/SurveyCheckpoint",
  component: SurveyCheckpoint,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    visual: <span className={NUMBER_CLASS_NAME}>50%</span>,
    leadIn: "Jesteś na półmetku",
    statement: "To już prawie koniec, pozostałe pytania zajmą ok. 4 min.",
    onContinue: fn(),
    onOptOut: fn(),
  },
} satisfies Meta<typeof SurveyCheckpoint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Passive: Story = {};

export const WaitingForChoice: Story = {
  args: {
    visual: <span className={NUMBER_CLASS_NAME}>?</span>,
    leadIn: "Jak myślisz?",
    statement: "Do czego jest Tobie bliżej? Zgadnij teraz!",
    options: AXIS_OPTIONS.map((option) => (
      <button key={option} type="button" className={OPTION_CLASS_NAME}>
        {option}
      </button>
    )),
    isContinueAvailable: false,
  },
};

export const OptionsWithContinue: Story = {
  args: {
    visual: <span className={NUMBER_CLASS_NAME}>?</span>,
    leadIn: "Jak myślisz?",
    statement: "Do jednej z opcji jest Tobie bardzo blisko, zgadnij do której!",
    options: POSITION_OPTIONS.map((option) => (
      <button key={option} type="button" className={OPTION_CLASS_NAME}>
        {option}
      </button>
    )),
  },
};

export const NoLeadIn: Story = {
  args: { leadIn: undefined },
};

export const LongStatement: Story = {
  args: {
    visual: <span className={NUMBER_CLASS_NAME}>3%</span>,
    leadIn: "Rzadki okaz wśród wszystkich osób, które wypełniły ten quiz",
    statement:
      "Chrześcijańsko-demokratyczny konserwatyzm społeczno-gospodarczy jest Ci najbliższy, a do tego należysz do 3% osób, które popierają tezę „Państwo powinno w pierwszej kolejności dbać o bezpieczeństwo energetyczne kraju, nawet jeżeli oznacza to wolniejsze odchodzenie od paliw kopalnych, wyższe ceny uprawnień do emisji i spór z instytucjami Unii Europejskiej”.",
  },
};

export const Quote: Story = {
  args: {
    visual: <span className={NUMBER_CLASS_NAME}>10%</span>,
    leadIn: "Rzadki okaz",
    statement:
      "Należysz do 10% osób, które popierają tezę “Wielka Polska Katolicka w silnej chrześcijańskiej Europie.”.",
    quote: "“Wielka Polska Katolicka w silnej chrześcijańskiej Europie.”",
  },
};

// A puzzle on a guess: the visual, the text and the options are swapped in
// place, "Dalej" appears, and the focus moves to the new text.
export const ChangedInPlace: Story = {
  render: function Render(args) {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
      <SurveyCheckpoint
        {...args}
        visual={
          <span className={NUMBER_CLASS_NAME}>{isRevealed ? "62%" : "?"}</span>
        }
        leadIn={isRevealed ? "Trafione!" : "Jak myślisz?"}
        statement={
          isRevealed
            ? "Wolny rynek jest Ci najbliższy na tym etapie quizu."
            : "Do czego jest Tobie bliżej? Zgadnij teraz!"
        }
        options={
          isRevealed
            ? undefined
            : AXIS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={OPTION_CLASS_NAME}
                  onClick={() => setIsRevealed(true)}
                >
                  {option}
                </button>
              ))
        }
        isContinueAvailable={isRevealed}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Wolny rynek" }));

    const text = canvas.getByText(
      "Wolny rynek jest Ci najbliższy na tym etapie quizu.",
      { exact: false },
    );

    await expect(text).toHaveFocus();
    await expect(canvas.getByRole("button", { name: "Dalej" })).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Interwencjonizm" }),
    ).not.toBeInTheDocument();
  },
};

export const ContinueWithheldWithoutOptions: Story = {
  args: { isContinueAvailable: false },
};
