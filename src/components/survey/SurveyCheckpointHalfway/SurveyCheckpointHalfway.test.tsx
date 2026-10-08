import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { messages as enMessages } from "@/locales/en/messages";
import type { HalfwayCheckpointCard } from "@/types/checkpoint";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyCheckpointHalfway } from "./SurveyCheckpointHalfway";

const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const LEAD_IN = "Jesteś na półmetku";
// The three lines of the halfway pool, in its order, with seven minutes.
const LINES = [
  `${LEAD_IN} — To już prawie koniec, pozostałe pytania zajmą ok. 7 min.`,
  "Połowa za Tobą — Reszta pytań zajmie ok. 7 min.",
  "Teraz już z górki — Do końca quizu zostało ok. 7 min.",
];
const ENGLISH_LINE =
  "You are halfway there — Almost done, the remaining questions will take about 7 min.";

const createCard = (
  overrides: Partial<HalfwayCheckpointCard> = {},
): HalfwayCheckpointCard => ({
  type: "halfway",
  boundary: 5,
  line: { pool: "halfway", index: 0 },
  percent: 50,
  minutes: 7,
  ...overrides,
});

const renderCard = (overrides: Partial<HalfwayCheckpointCard> = {}) => {
  const card = createCard(overrides);
  const onReveal = vi.fn();
  const onContinue = vi.fn();
  const onOptOut = vi.fn();
  const element = (
    <SurveyCheckpointHalfway
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

const getRegion = () => screen.getByRole("region", { name: "Checkpoint" });

const getText = () => within(getRegion()).getByRole("paragraph");

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

describe("<SurveyCheckpointHalfway />", () => {
  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
  });

  describe("given a card with a percent of 50 and 7 minutes", () => {
    it('renders exactly one region named "Checkpoint"', () => {
      renderCard();

      expect(
        screen.getAllByRole("region", { name: "Checkpoint" }),
      ).toHaveLength(1);
    });

    it('shows "50%" in the visual, before the lead-in and the statement', () => {
      renderCard();

      const percent = within(getRegion()).getByText("50%");

      expect(percent).toBeVisible();
      expect(getText()).not.toContainElement(percent);
      expect(isBefore(percent, getText())).toBe(true);
    });

    it('shows the lead-in and the statement of the card\'s line, with "ok. 7 min." in it', () => {
      renderCard();

      expect(within(getRegion()).getAllByRole("paragraph")).toHaveLength(1);
      expect(getText()).toHaveTextContent(LINES[0]);
      expect(getText()).toHaveTextContent("ok. 7 min.");
      expect(within(getText()).getByText(LEAD_IN, { exact: false })).toBe(
        getText().firstElementChild,
      );
    });

    it('shows "Dalej" and "Wyłącz checkpointy", and no options', () => {
      renderCard();

      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual([CONTINUE, OPT_OUT]);
    });
  });

  describe("given a percent of 55", () => {
    it('shows "55%"', () => {
      renderCard({ percent: 55 });

      expect(within(getRegion()).getByText("55%")).toBeVisible();
      expect(screen.queryByText("50%")).not.toBeInTheDocument();
    });
  });

  describe("given a percent that is not whole", () => {
    it("shows it rounded down", () => {
      renderCard({ percent: 55.56 });

      expect(within(getRegion()).getByText("55%")).toBeVisible();
    });
  });

  describe("given a percent above 100", () => {
    it('shows "100%"', () => {
      renderCard({ percent: 120 });

      expect(within(getRegion()).getByText("100%")).toBeVisible();
    });
  });

  describe("given each of the three lines of the halfway pool", () => {
    it.each(
      LINES.map((line, index) => ({ line, index })),
    )("shows that line with the minutes in it: $line", ({ line, index }) => {
      renderCard({ line: { pool: "halfway", index } });

      expect(getText()).toHaveTextContent(line);
      expect(within(getRegion()).getByText("50%")).toBeVisible();
    });
  });

  describe("given 1 minute, and 99 minutes", () => {
    it.each([1, 99])("shows the number as given: %i", (minutes) => {
      renderCard({ minutes });

      expect(getText()).toHaveTextContent(
        `${LEAD_IN} — To już prawie koniec, pozostałe pytania zajmą ok. ${minutes} min.`,
      );
    });
  });

  describe("given the app is in English", () => {
    it("shows the same line in English", () => {
      activateEnglish();
      renderCard();

      expect(getText()).toHaveTextContent(ENGLISH_LINE);
      expect(within(getRegion()).getByText("50%")).toBeVisible();
    });
  });

  describe("when the language of the app changes while the card is up", () => {
    it("shows the same line in the other language", () => {
      const { onContinue } = renderCard({
        line: { pool: "halfway", index: 0 },
      });

      expect(getText()).toHaveTextContent(LINES[0]);

      activateEnglish();

      expect(getText()).toHaveTextContent(ENGLISH_LINE);
      expect(within(getRegion()).getByText("50%")).toBeVisible();
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("given a percent that is not a number", () => {
    it.each([
      Number.NaN,
      undefined,
      null,
      "55",
    ])("renders nothing: %s", (percent) => {
      const { container } = renderCard({ percent: percent as number });

      expect(container).toBeEmptyDOMElement();
    });

    it("calls onContinue once", () => {
      const { onContinue, onOptOut } = renderCard({ percent: Number.NaN });

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("given a card whose text cannot be built", () => {
    it.each([
      { name: "minutes below 1", overrides: { minutes: 0 } },
      {
        name: "minutes that are not a number",
        overrides: { minutes: Number.NaN },
      },
      {
        name: "a line that does not exist",
        overrides: { line: { pool: "halfway", index: 3 } },
      },
    ] satisfies {
      name: string;
      overrides: Partial<HalfwayCheckpointCard>;
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
    it("shows the same percentage and the same minutes", () => {
      const { element, rerender, onContinue } = renderCard({ percent: 55 });
      const text = getText().textContent;

      rerender(<I18nProvider i18n={i18n}>{element}</I18nProvider>);

      expect(within(getRegion()).getByText("55%")).toBeVisible();
      expect(getText().textContent).toBe(text);
      expect(getText()).toHaveTextContent("ok. 7 min.");
      expect(onContinue).not.toHaveBeenCalled();
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

  describe("accessibility", () => {
    it("exposes the percentage as text, not as an image", () => {
      renderCard();

      expect(within(getRegion()).getByText("50%").tagName).toBe("SPAN");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("does not repeat the percentage in an accessible name", () => {
      renderCard();

      const percent = within(getRegion()).getByText("50%");

      expect(percent).not.toHaveAttribute("aria-label");
      expect(percent).not.toHaveAttribute("title");
      expect(percent).not.toHaveAttribute("role");
      expect(percent).not.toHaveAttribute("aria-live");
      expect(getRegion().textContent?.match(/50%/g)).toHaveLength(1);
      expect(getRegion()).toHaveAccessibleName("Checkpoint");
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
    });
  });

  it("never calls onReveal", () => {
    const { onReveal } = renderCard();

    fireEvent.click(getButton(CONTINUE));
    fireEvent.click(getButton(OPT_OUT));

    expect(onReveal).not.toHaveBeenCalled();
  });

  it("shows no count of questions", () => {
    renderCard({ boundary: 5, percent: 55, minutes: 7 });

    // The percentage and the minutes are the only numbers on the card.
    expect(getRegion().textContent?.match(/\d+/g)).toEqual(["55", "7"]);
  });
});
