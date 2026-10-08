import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { HATCH_LIGHT_CLASS_NAME } from "@/constants/hatch";
import { messages as enMessages } from "@/locales/en/messages";
import type { NewTraitCheckpointCard } from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyCheckpointNewTrait } from "./SurveyCheckpointNewTrait";

const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const NAME = "Monarchizm";
const ICON_URL = "https://example.com/monarchism.svg";
const COLOR = "#9b51e0";
const LEAD_IN = "A to niespodzianka!";
const LONG_NAME =
  "Radykalizm społeczno-gospodarczy z bardzo długą nazwą autorską, która nie mieści się w karcie";
const QUOTED_NAME = 'Ruch „Wolność” i "Ład"';

// The three lines of the new trait pool, in its order, with a name in them.
const toLines = (name: string): string[] => [
  `${LEAD_IN} — Masz nową cechę: „${name}”... to dobrze, niedobrze?`,
  `Proszę, proszę — Do Twojego profilu trafia cecha „${name}”. Co Ty na to?`,
  `Nowość w kolekcji — Cecha „${name}” jest od teraz Twoja. Dobrze to czy źle? Ocena należy do Ciebie.`,
];
const LINES = toLines(NAME);
const ENGLISH_LINE = `Now that is a surprise! — You have a new trait: “${NAME}”... good, bad?`;

const createTrait = (overrides: Partial<Orientation> = {}): Orientation =>
  createOrientation("monarchism", NAME, {
    imageUrl: ICON_URL,
    color: COLOR,
    ...overrides,
  });

const createCard = (
  overrides: Partial<NewTraitCheckpointCard> = {},
): NewTraitCheckpointCard => ({
  type: "new-trait",
  boundary: 12,
  line: { pool: "new-trait", index: 0 },
  trait: createTrait(),
  ...overrides,
});

const renderCard = (overrides: Partial<NewTraitCheckpointCard> = {}) => {
  const card = createCard(overrides);
  const onReveal = vi.fn();
  const onContinue = vi.fn();
  const onOptOut = vi.fn();
  const element = (
    <SurveyCheckpointNewTrait
      card={card}
      onReveal={onReveal}
      onContinue={onContinue}
      onOptOut={onOptOut}
    />
  );

  return {
    ...renderWithI18n(element),
    element,
    onReveal,
    onContinue,
    onOptOut,
  };
};

const renderTrait = (overrides: Partial<Orientation>) =>
  renderCard({ trait: createTrait(overrides) });

const getRegion = () => screen.getByRole("region", { name: "Checkpoint" });

const getText = () => within(getRegion()).getByRole("paragraph");

// The paragraph as it reads, character for character: the frame ties its dash
// to the lead-in with a no-break space.
const getLine = () => getText().textContent?.replaceAll(" ", " ");

const getPill = () => within(getRegion()).getByTestId("trait-pill");

const getPillBody = () => within(getPill()).getByTestId("trait-pill-body");

const getButton = (name: string) => screen.getByRole("button", { name });

const isBefore = (first: Element, second: Element): boolean =>
  Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

const activateEnglish = () =>
  act(() => {
    i18n.load("en", enMessages);
    i18n.activate("en");
  });

describe("<SurveyCheckpointNewTrait />", () => {
  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
  });

  describe("given a card with a trait", () => {
    it('renders exactly one region named "Checkpoint"', () => {
      renderCard();

      expect(
        screen.getAllByRole("region", { name: "Checkpoint" }),
      ).toHaveLength(1);
    });

    it("shows one pill with the trait's name, before the lead-in and the statement", () => {
      renderCard();

      expect(within(getRegion()).getAllByTestId("trait-pill")).toHaveLength(1);
      expect(getPill()).toBeVisible();
      expect(getPill()).toHaveTextContent(/^Monarchizm$/);
      expect(getText()).not.toContainElement(getPill());
      expect(isBefore(getPill(), getText())).toBe(true);
    });

    it("shows the trait's icon as decoration, before the name, on the trait's colour", () => {
      renderCard();

      const icon = within(getPill()).getByTestId("trait-pill-image");

      expect(icon).toHaveAttribute("src", ICON_URL);
      expect(icon).toHaveAttribute("alt", "");
      expect(icon.nextElementSibling).toHaveTextContent(NAME);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(getPillBody().style.getPropertyValue("--trait-color")).toBe(COLOR);
      expect(getPillBody()).toHaveClass("bg-(--trait-color)", "text-white");
    });

    it("shows the pill as a single item, not inside a list", () => {
      renderCard();

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
      expect(getPill().closest("ul, ol, li")).toBeNull();
    });

    it("shows no avatar and no hatching", () => {
      renderCard();

      expect(screen.queryByTestId("trait-pill-avatar")).not.toBeInTheDocument();
      expect(getPillBody()).not.toHaveClass(HATCH_LIGHT_CLASS_NAME);
      expect(getPill()).toHaveAttribute("data-holder", "taker");
      expect(within(getPill()).getByText(NAME)).not.toHaveAttribute(
        "aria-hidden",
      );
    });

    it("shows the lead-in and the statement of the card's line, with the name in quotation marks", () => {
      renderCard();

      expect(within(getRegion()).getAllByRole("paragraph")).toHaveLength(1);
      expect(getText()).toHaveTextContent(LINES[0]);
      expect(getText()).toHaveTextContent(`„${NAME}”`);
      expect(within(getText()).getByText(LEAD_IN, { exact: false })).toBe(
        getText().firstElementChild,
      );
    });

    it("marks no part of the statement as a quotation", () => {
      renderCard();

      // The frame's `quote` is the stats card's: here the marks are the
      // line's own and the name is plain text.
      expect(getText().querySelector("q")).toBeNull();
    });

    it('shows "Dalej" and "Wyłącz checkpointy", and no options', () => {
      renderCard();

      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual([CONTINUE, OPT_OUT]);
    });

    it("shows no number, no bar and no second pill", () => {
      renderCard();

      expect(getRegion().textContent).not.toMatch(/\d/);
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.queryByRole("meter")).not.toBeInTheDocument();
      expect(getRegion().textContent?.match(/Monarchizm/g)).toHaveLength(2);
    });
  });

  describe("given a trait without an icon", () => {
    it("shows the name alone", () => {
      renderTrait({ imageUrl: undefined });

      expect(getPill()).toHaveTextContent(/^Monarchizm$/);
      expect(screen.queryByTestId("trait-pill-image")).not.toBeInTheDocument();
      expect(getText()).toHaveTextContent(LINES[0]);
    });
  });

  describe("given a trait without a colour, and one with a light colour", () => {
    it.each([
      undefined,
      "red; background: url(x)",
    ])("shows the pill as the traits module does, in the neutral colour: %j", (color) => {
      renderTrait({ color });

      expect(getPillBody().style.getPropertyValue("--trait-color")).toBe("");
      expect(getPillBody()).toHaveClass("bg-gi-dark-gray", "text-white");
      expect(getPillBody()).not.toHaveClass("bg-(--trait-color)");
    });

    it("shows the pill as the traits module does, with a dark label and a dark icon", () => {
      renderTrait({ color: "#ffe066" });

      expect(getPillBody().style.getPropertyValue("--trait-color")).toBe(
        "#ffe066",
      );
      expect(getPillBody()).toHaveClass("text-gi-primary");
      expect(getPillBody()).not.toHaveClass("text-white");
      expect(within(getPill()).getByTestId("trait-pill-image")).toHaveClass(
        "brightness-0",
      );
    });
  });

  describe("given each of the three lines of the new trait pool", () => {
    it.each(
      LINES.map((line, index) => ({ line, index })),
    )("shows that line with the name in it: $line", ({ line, index }) => {
      renderCard({ line: { pool: "new-trait", index } });

      expect(getText()).toHaveTextContent(line);
      expect(getPill()).toHaveTextContent(/^Monarchizm$/);
    });
  });

  describe("given a long name", () => {
    it("keeps the full name on the pill for assistive technology", () => {
      renderTrait({ name: LONG_NAME });

      const label = within(getPill()).getByText(LONG_NAME);

      // Cut by the style alone, to one line and to the width of the slot.
      expect(label).toHaveClass("truncate", "min-w-0");
      expect(label).not.toHaveAttribute("aria-hidden");
      expect(getPill()).toHaveClass("max-w-full", "min-w-0");
      expect(getPill().textContent).toBe(LONG_NAME);
    });

    it("shows the full name in the statement", () => {
      renderTrait({ name: LONG_NAME });

      expect(getText()).toHaveTextContent(toLines(LONG_NAME)[0]);
      expect(getText()).toHaveClass("wrap-break-word");
      expect(getText()).not.toHaveClass("truncate");
    });
  });

  describe("given a name with quotation marks", () => {
    it("shows it as written", () => {
      renderTrait({ name: QUOTED_NAME });

      expect(getPill().textContent).toBe(QUOTED_NAME);
      expect(getLine()).toBe(toLines(QUOTED_NAME)[0]);
      expect(getText()).toHaveTextContent(`„${QUOTED_NAME}”`);
    });
  });

  describe("given a name that reads like markup or like a slot", () => {
    it("shows it as plain text", () => {
      const name = "<b>{trait}</b> & {minutes}";

      renderTrait({ name });

      expect(getPill().textContent).toBe(name);
      expect(getLine()).toBe(toLines(name)[0]);
      expect(getRegion().querySelector("b")).toBeNull();
    });
  });

  describe("given a name with line breaks or doubled spaces", () => {
    it("collapses it to one line, on the pill and in the statement", () => {
      renderTrait({ name: " Pro\n\nEuro   2 " });

      expect(getPill().textContent).toBe("Pro Euro 2");
      expect(getLine()).toBe(toLines("Pro Euro 2")[0]);
    });
  });

  describe("given the app is in English", () => {
    it("shows the same line in English, with the name unchanged", () => {
      activateEnglish();
      renderCard();

      expect(getText()).toHaveTextContent(ENGLISH_LINE);
      expect(getPill()).toHaveTextContent(/^Monarchizm$/);
    });
  });

  describe("when the language of the app changes while the card is up", () => {
    it("shows the same line in the other language", () => {
      const { onContinue } = renderCard();

      expect(getText()).toHaveTextContent(LINES[0]);

      activateEnglish();

      expect(getText()).toHaveTextContent(ENGLISH_LINE);
      expect(getPill()).toHaveTextContent(/^Monarchizm$/);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("given a trait without a name", () => {
    it.each([
      undefined,
      null,
      "",
      " \n ",
      12,
    ])("renders nothing and calls onContinue once: %j", (name) => {
      const { container, onContinue, onOptOut } = renderTrait({
        name: name as string,
      });

      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("given a card whose text cannot be built", () => {
    it.each([
      {
        name: "a line that does not exist",
        overrides: { line: { pool: "new-trait", index: 3 } },
      },
      {
        name: "a line of another card",
        overrides: { line: { pool: "halfway", index: 0 } },
      },
      {
        name: "no line",
        overrides: { line: undefined as never },
      },
      {
        name: "no trait",
        overrides: { trait: undefined as never },
      },
    ] satisfies {
      name: string;
      overrides: Partial<NewTraitCheckpointCard>;
    }[])("renders nothing and calls onContinue once: $name", ({
      overrides,
    }) => {
      const { container, onContinue, onOptOut } = renderCard(overrides);

      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("when rendered again with the same card", () => {
    it("shows the same pill and the same line", () => {
      const { element, rerender, onContinue } = renderCard();
      const content = getRegion().innerHTML;

      rerender(<I18nProvider i18n={i18n}>{element}</I18nProvider>);

      expect(getRegion().innerHTML).toBe(content);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("when the pill is pressed", () => {
    it("calls nothing", () => {
      const { onReveal, onContinue, onOptOut } = renderCard();
      const content = getRegion().innerHTML;

      fireEvent.click(getPill());
      fireEvent.click(within(getPill()).getByText(NAME));
      fireEvent.keyDown(getPill(), { key: "Enter" });

      expect(onReveal).not.toHaveBeenCalled();
      expect(onContinue).not.toHaveBeenCalled();
      expect(onOptOut).not.toHaveBeenCalled();
      expect(getRegion().innerHTML).toBe(content);
    });
  });

  describe('when "Dalej" is activated', () => {
    it("calls onContinue once", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(CONTINUE));

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe('when "Wyłącz checkpointy" is activated', () => {
    it("calls onOptOut once", () => {
      const { onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(OPT_OUT));

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  it("never calls onReveal", () => {
    const { onReveal } = renderCard();

    fireEvent.click(getPill());
    fireEvent.click(getButton(CONTINUE));
    fireEvent.click(getButton(OPT_OUT));

    expect(onReveal).not.toHaveBeenCalled();
  });

  it("adds no focusable element of its own", () => {
    renderCard();

    // The paragraph takes the focus from the frame's script only.
    expect(
      [...getRegion().querySelectorAll("button, a, input, [tabindex]")].map(
        (element) => element.textContent,
      ),
    ).toEqual([getText().textContent, CONTINUE, OPT_OUT]);
    expect(getText()).toHaveAttribute("tabindex", "-1");
    expect(getPill().querySelector("[tabindex]")).toBeNull();
    expect(getPill()).not.toHaveAttribute("tabindex");
    expect(getPill()).not.toHaveAttribute("role");
  });
});
