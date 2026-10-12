import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { messages as enMessages } from "@/locales/en/messages";
import type { StatsCheckpointCard } from "@/types/checkpoint";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyCheckpointStats } from "./SurveyCheckpointStats";

const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const THESIS = "Wielka Polska Katolicka w silnej chrześcijańskiej Europie";
const DESCRIPTION = "Za: 10%, Przeciw: 60%, Brak odpowiedzi: 30%";
// The lines of the two pools, in their order, with 10% and the thesis.
const FOR_LINES = [
  `Rzadki okaz — Należysz do 10% osób, które popierają tezę „${THESIS}”.`,
  `Niewielu Was — Tezę „${THESIS}” popiera tylko 10% osób. Ty też.`,
  `Jesteś w małej grupie — Tylko 10% osób jest za tezą „${THESIS}”.`,
];
const AGAINST_LINES = [
  `Rzadki okaz — Należysz do 10% osób, które nie zgadzają się z tezą „${THESIS}”.`,
  `Pod prąd — Tezę „${THESIS}” odrzuca tylko 10% osób. Ty też.`,
  `Jesteś w małej grupie — Tylko 10% osób jest przeciw tezie „${THESIS}”.`,
];
const ENGLISH_LINE = `A rare specimen — You are among the 10% of people who support the thesis “${THESIS}”.`;
const ENGLISH_DESCRIPTION = "For: 10%, Against: 60%, No answer: 30%";

const createCard = (
  overrides: Partial<StatsCheckpointCard> = {},
): StatsCheckpointCard => ({
  type: "stats",
  boundary: 5,
  line: { pool: "stats-for", index: 0 },
  questionId: "q5",
  thesis: `${THESIS}.`,
  side: "for",
  counts: { for: 100, against: 600, noAnswer: 300 },
  percent: 10,
  ...overrides,
});

const AGAINST: Partial<StatsCheckpointCard> = {
  line: { pool: "stats-against", index: 0 },
  side: "against",
  counts: { for: 600, against: 100, noAnswer: 300 },
};

const renderCard = (overrides: Partial<StatsCheckpointCard> = {}) => {
  const card = createCard(overrides);
  const onReveal = vi.fn();
  const onContinue = vi.fn();
  const onOptOut = vi.fn();
  const element = (
    <SurveyCheckpointStats
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

const getPie = () => within(getRegion()).getByRole("img");

const getLegend = () => within(getRegion()).getByRole("list");

const getLegendNames = () =>
  within(getLegend())
    .getAllByRole("listitem")
    .map((row) => row.textContent);

const getShapes = () =>
  [...getPie().querySelectorAll("path")].map((shape) =>
    shape.getAttribute("d"),
  );

const getQuotation = () => getText().querySelector("q");

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

describe("<SurveyCheckpointStats />", () => {
  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
  });

  describe('given a card on the "for" side', () => {
    it('renders exactly one region named "Checkpoint"', () => {
      renderCard();

      expect(
        screen.getAllByRole("region", { name: "Checkpoint" }),
      ).toHaveLength(1);
    });

    it("shows the pie and the legend in the visual, before the lead-in and the statement", () => {
      renderCard();

      expect(getPie()).toBeVisible();
      expect(getPie()).toHaveAccessibleName(DESCRIPTION);
      expect(getLegendNames()).toEqual(["Za", "Przeciw", "Brak odpowiedzi"]);
      expect(isBefore(getPie(), getLegend())).toBe(true);
      expect(isBefore(getLegend(), getText())).toBe(true);
      expect(getText()).not.toContainElement(getPie());
    });

    it("sizes the three slices by the counts of the card", () => {
      renderCard();

      expect(getShapes()).toEqual([
        "M 48 48 L 48 0 A 48 48 0 0 1 76.21 9.17 Z",
        "M 48 48 L 76.21 9.17 A 48 48 0 1 1 2.35 62.83 Z",
        "M 48 48 L 2.35 62.83 A 48 48 0 0 1 48 0 Z",
      ]);
    });

    it('shows the statement of the "for" pool with the percent and the thesis in it', () => {
      renderCard();

      expect(within(getRegion()).getAllByRole("paragraph")).toHaveLength(1);
      expect(getText()).toHaveTextContent(FOR_LINES[0]);
      expect(within(getText()).getByText("Rzadki okaz", { exact: false })).toBe(
        getText().firstElementChild,
      );
    });

    it("marks the thesis as a quotation", () => {
      renderCard();

      expect(getText().querySelectorAll("q")).toHaveLength(1);
      expect(getQuotation()).toHaveTextContent(`„${THESIS}”`);
      expect(getQuotation()).toBeVisible();
    });

    it('shows "Dalej" and "Wyłącz checkpointy", and no options', () => {
      renderCard();

      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual([CONTINUE, OPT_OUT]);
    });
  });

  describe('given a card on the "against" side', () => {
    it('shows the statement of the "against" pool', () => {
      renderCard(AGAINST);

      expect(getText()).toHaveTextContent(AGAINST_LINES[0]);
      expect(getQuotation()).toHaveTextContent(`„${THESIS}”`);
    });

    it("draws the same pie and the same legend", () => {
      const { unmount } = renderCard();
      const shapes = getShapes();
      const names = getLegendNames();

      unmount();
      renderCard({ ...AGAINST, counts: createCard().counts });

      expect(getShapes()).toEqual(shapes);
      expect(getLegendNames()).toEqual(names);
    });

    it("gives the percent of the card to the taker's slice in the description", () => {
      renderCard({ ...AGAINST, percent: 9 });

      expect(getPie()).toHaveAccessibleName(
        "Za: 60%, Przeciw: 9%, Brak odpowiedzi: 30%",
      );
      expect(getText()).toHaveTextContent("9%");
    });
  });

  describe("given each line of the two pools", () => {
    const lines: { line: string; overrides: Partial<StatsCheckpointCard> }[] = [
      ...FOR_LINES.map((line, index) => ({
        line,
        overrides: { line: { pool: "stats-for" as const, index } },
      })),
      ...AGAINST_LINES.map((line, index) => ({
        line,
        overrides: {
          ...AGAINST,
          line: { pool: "stats-against" as const, index },
        },
      })),
    ];

    it.each(
      lines,
    )("shows that line with the percent and the thesis in it: $line", ({
      line,
      overrides,
    }) => {
      renderCard(overrides);

      expect(getText()).toHaveTextContent(line);
      expect(getQuotation()).toHaveTextContent(`„${THESIS}”`);
      expect(getPie()).toBeVisible();
    });
  });

  describe("given a thesis that ends with a full stop", () => {
    it("quotes it without that full stop and ends the statement with one full stop", () => {
      renderCard({ thesis: "Podatki powinny być niższe." });

      expect(getQuotation()).toHaveTextContent(
        /^„Podatki powinny być niższe”$/,
      );
      expect(getText()).toHaveTextContent(
        /tezę „Podatki powinny być niższe”\.$/,
      );
    });
  });

  describe("given a thesis that ends with a question mark", () => {
    it("keeps the mark", () => {
      renderCard({ thesis: "Czy Polska powinna przyjąć euro?" });

      expect(getText()).toHaveTextContent(
        "tezę „Czy Polska powinna przyjąć euro?”.",
      );
    });
  });

  describe("given a thesis with quotation marks, and a long thesis", () => {
    it.each([
      "Hasło „Polska dla Polaków” powinno być zakazane",
      'Tak zwany "wolny rynek" nie istnieje',
      "Państwo powinno w pełni finansować z budżetu ochronę zdrowia, edukację na każdym poziomie, transport publiczny w miastach i poza nimi oraz budowę mieszkań na wynajem, nawet jeśli oznacza to wyraźnie wyższe podatki dla wszystkich pracujących",
    ])("shows it as written, in full: %s", (thesis) => {
      renderCard({ thesis: `${thesis}.` });

      expect(getText()).toHaveTextContent(
        `Rzadki okaz — Należysz do 10% osób, które popierają tezę „${thesis}”.`,
      );
      expect(getQuotation()).toHaveTextContent(`„${thesis}”`);
      expect(getQuotation()?.textContent).toBe(`„${thesis}”`);
      expect(getText().className).not.toMatch(/truncate|line-clamp/);
    });
  });

  describe("given a thesis with line breaks or doubled spaces", () => {
    it("still marks it as a quotation", () => {
      renderCard({ thesis: "Podatki  powinny\nbyć niższe." });

      expect(getQuotation()?.textContent).toBe("„Podatki powinny być niższe”");
      expect(getText().textContent).toMatch(
        /— Należysz do 10% osób, które popierają tezę „Podatki powinny być niższe”.$/,
      );
    });
  });

  describe("given the app is in English", () => {
    it("shows the line, the legend and the description in English, and the thesis unchanged", () => {
      activateEnglish();
      renderCard();

      expect(getText()).toHaveTextContent(ENGLISH_LINE);
      expect(getLegendNames()).toEqual(["For", "Against", "No answer"]);
      expect(getPie()).toHaveAccessibleName(ENGLISH_DESCRIPTION);
      expect(getQuotation()).toHaveTextContent(`“${THESIS}”`);
    });
  });

  describe("when the language of the app changes while the card is up", () => {
    it("shows the same line, the legend and the description in the other language", () => {
      const { onContinue } = renderCard();

      expect(getText()).toHaveTextContent(FOR_LINES[0]);

      activateEnglish();

      expect(getText()).toHaveTextContent(ENGLISH_LINE);
      expect(getLegendNames()).toEqual(["For", "Against", "No answer"]);
      expect(getPie()).toHaveAccessibleName(ENGLISH_DESCRIPTION);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("given a count of zero for the taker's side", () => {
    it("draws no slice for it, keeps its legend row and reads 1%", () => {
      renderCard({
        counts: { for: 0, against: 700, noAnswer: 300 },
        percent: 1,
      });

      expect(getShapes()).toHaveLength(2);
      expect(getLegendNames()).toEqual(["Za", "Przeciw", "Brak odpowiedzi"]);
      expect(getText()).toHaveTextContent("Należysz do 1% osób");
      expect(getPie()).toHaveAccessibleName(
        "Za: 1%, Przeciw: 70%, Brak odpowiedzi: 30%",
      );
    });
  });

  describe("given one count that holds everything", () => {
    it("draws a full circle", () => {
      renderCard({
        counts: { for: 0, against: 1000, noAnswer: 0 },
        percent: 1,
      });

      expect(getShapes()).toEqual([
        "M 48 0 A 48 48 0 1 1 48 96 A 48 48 0 1 1 48 0 Z",
      ]);
    });
  });

  describe("given counts that cannot be drawn", () => {
    it.each([
      {
        name: "three counts of zero",
        counts: { for: 0, against: 0, noAnswer: 0 },
      },
      {
        name: "a negative count",
        counts: { for: -1, against: 600, noAnswer: 300 },
      },
      {
        name: "a count that is not a number",
        counts: { for: Number.NaN, against: 600, noAnswer: 300 },
      },
      { name: "no counts", counts: undefined },
    ])("renders nothing and calls onContinue once: $name", ({ counts }) => {
      const { container, onContinue, onOptOut } = renderCard({
        counts: counts as StatsCheckpointCard["counts"],
      });

      expect(container).toBeEmptyDOMElement();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("given a card whose text cannot be built", () => {
    it.each([
      { name: "an empty thesis", overrides: { thesis: "  " } },
      { name: "a percent below 1", overrides: { percent: 0 } },
      { name: "a percent above 10", overrides: { percent: 11 } },
      {
        name: "a percent that is not a number",
        overrides: { percent: Number.NaN },
      },
      {
        name: "a line that does not exist",
        overrides: { line: { pool: "stats-for", index: 3 } },
      },
      {
        name: "a line of the other side",
        overrides: { line: { pool: "stats-against", index: 0 } },
      },
    ] satisfies {
      name: string;
      overrides: Partial<StatsCheckpointCard>;
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
    it("shows the same pie and the same text", () => {
      const { element, rerender, onContinue } = renderCard();
      const shapes = getShapes();
      const text = getText().textContent;

      rerender(<I18nProvider i18n={i18n}>{element}</I18nProvider>);

      expect(getShapes()).toEqual(shapes);
      expect(getText().textContent).toBe(text);
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

  it("shows no number in the visual", () => {
    renderCard();

    expect(getPie().textContent).toBe("");
    expect(getLegend().textContent).not.toMatch(/[\d%]/);
    // The one number on the card is the percent of the statement.
    expect(getRegion().textContent?.match(/\d+/g)).toEqual(["10"]);
  });

  it("marks no slice and no legend row as the taker's", () => {
    // As many for as against: the two cards differ in the side alone.
    const counts = { for: 100, against: 100, noAnswer: 800 };
    const { unmount } = renderCard({ counts });
    const forSide = getRegion().querySelector("div")?.innerHTML;

    unmount();
    renderCard({ ...AGAINST, counts });

    expect(forSide).toContain("<svg");
    expect(getRegion().querySelector("div")?.innerHTML).toBe(forSide);
  });

  it("never calls onReveal", () => {
    const { onReveal } = renderCard();

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
  });
});
