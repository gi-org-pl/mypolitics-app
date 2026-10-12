import { type I18n, setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { messages as enMessages } from "@/locales/en/messages";
import { messages as plMessages } from "@/locales/pl/messages";
import type { AxisEntry } from "@/types/axis";
import type {
  AxisPuzzleCheckpointCard,
  CheckpointCardProps,
  CheckpointLine,
} from "@/types/checkpoint";
import { createAxisPair } from "@/utils/vitest/createAxisPair";

import { SurveyCheckpointAxisPuzzle } from "./SurveyCheckpointAxisPuzzle";

const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const START_NAME = "Interwencjonizm";
const END_NAME = "Wolny rynek";
const HIDDEN = `„${START_NAME}” i „${END_NAME}”: wynik ukryty`;

// The lines of the three pools, in the order the pools hold them, with the
// name of the leading pole of the cards below in its slot.
const ASK_STATEMENTS = [
  "Do czego jest Tobie bliżej? Zgadnij teraz!",
  "Która strona tej osi jest Ci bliższa? Wybierz jedną!",
  "Po której stronie wypadasz na tym etapie quizu? Zgadnij!",
];
const ASK_LINES = [
  `Jak myślisz? — ${ASK_STATEMENTS[0]}`,
  `Mała zagadka — ${ASK_STATEMENTS[1]}`,
  `Sprawdźmy intuicję — ${ASK_STATEMENTS[2]}`,
];
const HIT_LINES = [
  `Trafione! — Na tym etapie quizu bliżej Ci do strony „${END_NAME}”.`,
  `Znasz siebie — Jak dotąd wygrywa u Ciebie strona „${END_NAME}”.`,
  `Bez pudła — Tak, na tym etapie quizu prowadzi u Ciebie strona „${END_NAME}”.`,
];
const MISS_LINES = [
  "A to ciekawe! — Wyszło inaczej, niż się spodziewasz.",
  `Niespodzianka — Na tym etapie quizu bliżej Ci jednak do strony „${END_NAME}”.`,
  `No proszę — Twoje odpowiedzi wskazują jak dotąd na stronę „${END_NAME}”.`,
];

// The catalogs of the app, as `root.tsx` loads them.
const createI18n = (locale: "pl" | "en" = "pl"): I18n =>
  setupI18n({ locale, messages: { en: enMessages, pl: plMessages } });

// The card of the Figma frames: the end pole leads.
const createCard = (
  startValue = 44,
  endValue = 56,
  overrides: Partial<AxisPuzzleCheckpointCard> = {},
): AxisPuzzleCheckpointCard => {
  const { start, end } = createAxisPair(
    "economy",
    START_NAME,
    END_NAME,
    startValue,
    endValue,
  );

  return {
    type: "axis-puzzle",
    boundary: 11,
    axisId: "economy",
    start,
    end,
    leadingSide: endValue > startValue ? "end" : "start",
    line: { pool: "axis-puzzle-ask", index: 0 },
    ...overrides,
  };
};

const withOrientation = (
  entry: AxisEntry,
  overrides: Partial<AxisEntry["orientation"]>,
): AxisEntry => ({
  ...entry,
  orientation: { ...entry.orientation, ...overrides },
});

// `onReveal` as the phase gives it: a line of the hit or the miss pool, by
// its place in the pool.
const createReveal = (index = 0) =>
  vi.fn<CheckpointCardProps["onReveal"]>(
    (outcome): CheckpointLine => ({
      pool: outcome === "hit" ? "axis-puzzle-hit" : "axis-puzzle-miss",
      index,
    }),
  );

const renderCard = (
  card: AxisPuzzleCheckpointCard = createCard(),
  onReveal: CheckpointCardProps["onReveal"] = createReveal(),
  i18n: I18n = createI18n(),
) => {
  const onContinue = vi.fn();
  const onOptOut = vi.fn();

  return {
    ...render(
      <I18nProvider i18n={i18n}>
        <SurveyCheckpointAxisPuzzle
          card={card}
          onReveal={onReveal}
          onContinue={onContinue}
          onOptOut={onOptOut}
        />
      </I18nProvider>,
    ),
    i18n,
    onReveal,
    onContinue,
    onOptOut,
  };
};

const getRegion = () => screen.getByRole("region", { name: "Checkpoint" });

const queryRegion = () => screen.queryByRole("region", { name: "Checkpoint" });

const getBar = () => within(getRegion()).getByRole("img");

const getText = () => within(getRegion()).getByRole("paragraph");

const getButton = (name: string) => screen.getByRole("button", { name });

const queryButton = (name: string) => screen.queryByRole("button", { name });

const getButtonNames = () =>
  within(getRegion())
    .getAllByRole("button")
    .map((button) => button.textContent);

const getLabels = () => screen.getByTestId("universal-axis-labels");

const getFillWidth = (side: "start" | "end"): string =>
  screen.getByTestId(`universal-axis-fill-${side}`).style.width;

const pick = (name: string) => fireEvent.click(getButton(name));

describe("<SurveyCheckpointAxisPuzzle />", () => {
  describe("given a card, before a guess", () => {
    it("renders one checkpoint frame with the masked bar and the ask line", () => {
      renderCard();

      expect(screen.getAllByRole("region")).toHaveLength(1);
      expect(getRegion()).toBeVisible();
      expect(within(getRegion()).getAllByRole("img")).toHaveLength(1);
      expect(getBar()).toContainElement(
        screen.getByTestId("universal-axis-mask"),
      );
      expect(screen.getByTestId("universal-axis-cap-start")).toBeVisible();
      expect(screen.getByTestId("universal-axis-cap-end")).toBeVisible();
      expect(getText()).toHaveTextContent(ASK_LINES[0]);
    });

    it("shows the ask line the card carries", () => {
      const { unmount } = renderCard(
        createCard(44, 56, { line: { pool: "axis-puzzle-ask", index: 1 } }),
      );

      expect(getText()).toHaveTextContent(ASK_LINES[1]);

      unmount();
      renderCard(
        createCard(44, 56, { line: { pool: "axis-puzzle-ask", index: 2 } }),
      );

      expect(getText()).toHaveTextContent(ASK_LINES[2]);
    });

    it("shows both pole names under the bar", () => {
      renderCard();

      expect(getLabels().firstElementChild).toHaveTextContent(START_NAME);
      expect(getLabels().lastElementChild).toHaveTextContent(END_NAME);
      expect(getBar()).toContainElement(getLabels());
    });

    it("offers two options: the start pole first, the end pole second", () => {
      renderCard();

      const group = screen.getByRole("group");

      expect(
        within(group)
          .getAllByRole("button")
          .map((row) => row.textContent),
      ).toEqual([START_NAME, END_NAME]);
    });

    it("keeps that order when the start pole leads", () => {
      renderCard(createCard(73, 27));

      expect(getButtonNames()).toEqual([START_NAME, END_NAME, OPT_OUT]);
    });

    it("names the group of options by the statement", () => {
      renderCard();

      expect(screen.getByRole("group")).toHaveAccessibleName(ASK_STATEMENTS[0]);
    });

    it('does not render "Dalej"', () => {
      renderCard();

      expect(queryButton(CONTINUE)).not.toBeInTheDocument();
    });

    it('renders "Wyłącz checkpointy"', () => {
      renderCard();

      expect(getButton(OPT_OUT)).toBeVisible();
    });

    it("has no number, no fill and no marker anywhere in the document", () => {
      const { container } = renderCard(createCard(27, 73));

      expect(screen.queryByTestId(/universal-axis-fill/)).toBeNull();
      expect(screen.queryByTestId(/universal-axis-value/)).toBeNull();
      expect(screen.queryByTestId("universal-axis-marker")).toBeNull();
      expect(container.textContent).not.toMatch(/[\d%]/);
      expect(getBar().getAttribute("aria-label")).not.toMatch(/[\d%]/);
      expect(container.innerHTML).not.toMatch(/27|73/);
    });

    it("draws the same card whatever the values and the leading side", () => {
      const first = renderCard(createCard(27, 73));
      const markup = first.container.innerHTML;

      first.unmount();

      const second = renderCard(createCard(90, 12));

      expect(second.container.innerHTML).toBe(markup);
    });

    it("describes the bar as hidden", () => {
      renderCard();

      expect(getBar()).toHaveAccessibleName(HIDDEN);
    });

    it('reaches the options before "Wyłącz checkpointy" with the Tab key', async () => {
      const user = userEvent.setup();

      renderCard();

      await user.tab();
      expect(getButton(START_NAME)).toHaveFocus();

      await user.tab();
      expect(getButton(END_NAME)).toHaveFocus();

      await user.tab();
      expect(getButton(OPT_OUT)).toHaveFocus();
    });

    it("calls nothing by itself", () => {
      const { onReveal, onContinue, onOptOut } = renderCard();

      expect(onReveal).not.toHaveBeenCalled();
      expect(onContinue).not.toHaveBeenCalled();
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("when the leading pole is picked", () => {
    it('calls onReveal once with "hit"', () => {
      const { onReveal } = renderCard();

      pick(END_NAME);

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReveal).toHaveBeenCalledWith("hit");
    });

    it("shows the hit line with the name of the leading pole", () => {
      const { unmount } = renderCard();

      pick(END_NAME);

      expect(getText()).toHaveTextContent(HIT_LINES[0]);

      unmount();
      renderCard(createCard(), createReveal(2));
      pick(END_NAME);

      expect(getText()).toHaveTextContent(HIT_LINES[2]);
    });

    it("uncovers the bar: two fills, the marker, both names, no number", () => {
      renderCard();

      pick(END_NAME);

      expect(screen.queryByTestId("universal-axis-mask")).toBeNull();
      expect(getFillWidth("start")).toBe("44%");
      expect(getFillWidth("end")).toBe("56%");
      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("50%");
      expect(getLabels().firstElementChild).toHaveTextContent(START_NAME);
      expect(getLabels().lastElementChild).toHaveTextContent(END_NAME);
      expect(within(getRegion()).getAllByRole("img")).toHaveLength(1);
      expect(getRegion().textContent).not.toMatch(/[\d%]/);
    });

    it("describes the bar by the pole the taker is closer to", () => {
      renderCard();

      pick(END_NAME);

      expect(getBar()).toHaveAccessibleName(
        `„${START_NAME}” i „${END_NAME}”: bliżej Ci do strony „${END_NAME}”`,
      );
      expect(getBar().getAttribute("aria-label")).not.toMatch(/[\d%]/);
    });

    it("removes the options", () => {
      renderCard();

      pick(END_NAME);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
      expect(queryButton(START_NAME)).not.toBeInTheDocument();
      expect(queryButton(END_NAME)).not.toBeInTheDocument();
    });

    it('renders "Dalej"', () => {
      renderCard();

      pick(END_NAME);

      expect(getButtonNames()).toEqual([CONTINUE, OPT_OUT]);
    });

    it("has the focus on the text of the card", async () => {
      const user = userEvent.setup();

      renderCard();

      await user.click(getButton(END_NAME));

      expect(getText()).toHaveFocus();

      await user.tab();

      expect(getButton(CONTINUE)).toHaveFocus();
    });
  });

  describe("when the other pole is picked", () => {
    it('calls onReveal once with "miss"', () => {
      const { onReveal } = renderCard();

      pick(START_NAME);

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReveal).toHaveBeenCalledWith("miss");
    });

    it("shows the miss line", () => {
      const { unmount } = renderCard();

      pick(START_NAME);

      expect(getText()).toHaveTextContent(MISS_LINES[0]);

      unmount();
      renderCard(createCard(), createReveal(1));
      pick(START_NAME);

      expect(getText()).toHaveTextContent(MISS_LINES[1]);
    });

    it("uncovers the bar exactly as on a hit", () => {
      const hit = renderCard();

      pick(END_NAME);

      const bar = getBar().outerHTML;

      hit.unmount();
      renderCard();
      pick(START_NAME);

      expect(getBar().outerHTML).toBe(bar);
      expect(getBar()).toHaveAccessibleName(
        `„${START_NAME}” i „${END_NAME}”: bliżej Ci do strony „${END_NAME}”`,
      );
    });

    it("does not mark or repeat the picked option", () => {
      renderCard();

      pick(START_NAME);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
      expect(queryButton(START_NAME)).not.toBeInTheDocument();
      // The name of the picked pole is under the bar and nowhere else.
      expect(within(getRegion()).getAllByText(START_NAME)).toHaveLength(1);
      expect(getText()).not.toHaveTextContent(START_NAME);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("differs from a hit by its words alone", () => {
      const hit = renderCard();

      pick(END_NAME);

      const hitText = getText();
      const hitMarkup = getRegion().innerHTML.replace(hitText.innerHTML, "");

      hit.unmount();
      renderCard();
      pick(START_NAME);

      expect(getRegion().innerHTML.replace(getText().innerHTML, "")).toBe(
        hitMarkup,
      );
    });

    it('renders "Dalej"', () => {
      renderCard();

      pick(START_NAME);

      expect(getButtonNames()).toEqual([CONTINUE, OPT_OUT]);
    });
  });

  describe("given a card whose start side leads", () => {
    it("is a hit when the first option is picked", () => {
      const { onReveal } = renderCard(createCard(73, 27));

      pick(START_NAME);

      expect(onReveal).toHaveBeenCalledWith("hit");
      expect(getText()).toHaveTextContent(
        `Trafione! — Na tym etapie quizu bliżej Ci do strony „${START_NAME}”.`,
      );
      expect(getBar()).toHaveAccessibleName(
        `„${START_NAME}” i „${END_NAME}”: bliżej Ci do strony „${START_NAME}”`,
      );
    });

    it("is a miss when the second option is picked", () => {
      const { onReveal } = renderCard(createCard(73, 27), createReveal(1));

      pick(END_NAME);

      expect(onReveal).toHaveBeenCalledWith("miss");
      expect(getText()).toHaveTextContent(
        `Niespodzianka — Na tym etapie quizu bliżej Ci jednak do strony „${START_NAME}”.`,
      );
    });
  });

  describe("given a card whose leading side does not follow its values", () => {
    it("decides against the side the card names", () => {
      const { onReveal } = renderCard(
        createCard(44, 56, { leadingSide: "start" }),
      );

      pick(START_NAME);

      expect(onReveal).toHaveBeenCalledWith("hit");
    });
  });

  describe("when an option is picked twice in a row", () => {
    it("calls onReveal once", () => {
      const { onReveal } = renderCard();
      const option = getButton(END_NAME);
      const other = getButton(START_NAME);

      act(() => {
        option.click();
        option.click();
        other.click();
      });

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReveal).toHaveBeenCalledWith("hit");
      expect(getText()).toHaveTextContent(HIT_LINES[0]);
    });
  });

  describe("when onReveal gives no line", () => {
    it("calls onContinue once", () => {
      const onReveal = vi.fn<CheckpointCardProps["onReveal"]>();
      const { onContinue, onOptOut } = renderCard(createCard(), onReveal);

      pick(END_NAME);
      pick(START_NAME);

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
      // Nothing was revealed: the card still asks.
      expect(screen.getByTestId("universal-axis-mask")).toBeInTheDocument();
      expect(screen.queryByTestId(/universal-axis-fill/)).toBeNull();
    });
  });

  describe('when "Wyłącz checkpointy" is activated before a guess', () => {
    it("calls onOptOut once and never calls onReveal", () => {
      const { onReveal, onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(OPT_OUT));

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onReveal).not.toHaveBeenCalled();
      expect(onContinue).not.toHaveBeenCalled();
      expect(screen.getByTestId("universal-axis-mask")).toBeInTheDocument();
      expect(screen.queryByTestId(/universal-axis-fill/)).toBeNull();
    });
  });

  describe('when "Dalej" is activated after the reveal', () => {
    it("calls onContinue once", () => {
      const { onContinue, onOptOut } = renderCard();

      pick(END_NAME);
      fireEvent.click(getButton(CONTINUE));

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe('when "Wyłącz checkpointy" is activated after the reveal', () => {
    it("calls onOptOut once", () => {
      const { onContinue, onOptOut } = renderCard();

      pick(START_NAME);
      fireEvent.click(getButton(OPT_OUT));

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("when the card is mounted again", () => {
    it("asks again, with the same poles", () => {
      const card = createCard();
      const first = renderCard(card);
      const markup = first.container.innerHTML;

      pick(END_NAME);
      first.unmount();

      const second = renderCard(card);

      expect(second.container.innerHTML).toBe(markup);
      expect(getText()).toHaveTextContent(ASK_LINES[0]);
      expect(getButtonNames()).toEqual([START_NAME, END_NAME, OPT_OUT]);
      expect(getBar()).toHaveAccessibleName(HIDDEN);

      pick(START_NAME);

      expect(second.onReveal).toHaveBeenCalledWith("miss");
    });
  });

  describe("given values that do not reach 100 together", () => {
    it("leaves the gap in the middle of the uncovered bar", () => {
      renderCard(createCard(45, 20));

      pick(START_NAME);

      expect(getFillWidth("start")).toBe("45%");
      expect(getFillWidth("end")).toBe("20%");
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveClass(
        "left-0",
      );
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveClass(
        "right-0",
      );
    });
  });

  describe("given values that exceed 100 together, or lie outside 0-100", () => {
    it("lets the bar scale and clamp the fills", () => {
      const { unmount } = renderCard(createCard(90, 60));

      pick(START_NAME);

      expect(getFillWidth("start")).toBe("60%");
      expect(getFillWidth("end")).toBe("40%");

      unmount();
      renderCard(createCard(140, -20));
      pick(START_NAME);

      expect(getFillWidth("start")).toBe("100%");
      expect(getFillWidth("end")).toBe("0%");
    });
  });

  describe("given a pole without an image or without a colour", () => {
    it("shows the colour alone, or the neutral fallback, on the cap and on the option", () => {
      const card = createCard();

      renderCard({
        ...card,
        start: withOrientation(card.start, { imageUrl: undefined }),
        end: withOrientation(card.end, {
          imageUrl: undefined,
          color: undefined,
        }),
      });

      const [startImage, endImage] = screen.getAllByTestId(
        "survey-checkpoint-options-image",
      );
      const startCap = screen.getByTestId("universal-axis-cap-start");
      const endCap = screen.getByTestId("universal-axis-cap-end");

      expect(within(getRegion()).queryByRole("presentation")).toBeNull();
      expect(startCap).toBeEmptyDOMElement();
      expect(startCap.style.getPropertyValue("--axis-color")).toBe("#9b59b6");
      expect(startImage).toHaveStyle({ backgroundColor: "#9b59b6" });
      expect(startImage.style.backgroundImage).toBe("");
      expect(endCap).toHaveClass("bg-gi-dark-gray");
      expect(endCap).not.toHaveAttribute("style");
      expect(endImage).toHaveClass("bg-gi-dark-gray");
      expect(endImage).not.toHaveAttribute("style");

      pick(END_NAME);

      expect(screen.getByTestId("universal-axis-fill-end")).toHaveClass(
        "bg-gi-dark-gray",
      );
    });
  });

  describe("given a pole name with line breaks, or longer than the room under the bar", () => {
    it("puts it on one line, cut under the bar and whole in the option and in the description", () => {
      const card = createCard();
      const name = `Liberalizm \n gospodarczy  ${"i światopoglądowy ".repeat(6)}autorski`;
      const shown = name.replace(/\s+/g, " ");

      renderCard({ ...card, end: withOrientation(card.end, { name }) });

      expect(getButton(shown)).toBeVisible();
      expect(getLabels().lastElementChild).toHaveClass("truncate");
      expect(getBar()).toHaveAccessibleName(
        `„${START_NAME}” i „${shown}”: wynik ukryty`,
      );

      pick(shown);

      expect(getText()).toHaveTextContent(`„${shown}”`);
    });
  });

  describe("given a pole without a name", () => {
    it("renders nothing and calls onContinue once", () => {
      const card = createCard();
      const { onContinue, onReveal, onOptOut } = renderCard({
        ...card,
        start: withOrientation(card.start, { name: " \n " }),
      });

      expect(queryRegion()).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onReveal).not.toHaveBeenCalled();
      expect(onOptOut).not.toHaveBeenCalled();
    });

    it("does the same when the name is missing altogether", () => {
      const card = createCard();
      const { onContinue } = renderCard({
        ...card,
        end: withOrientation(card.end, { name: undefined }),
      });

      expect(queryRegion()).not.toBeInTheDocument();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a line that does not exist in the pools", () => {
    it("renders nothing and calls onContinue once", () => {
      const { onContinue, onReveal } = renderCard(
        createCard(44, 56, { line: { pool: "axis-puzzle-ask", index: 99 } }),
      );

      expect(queryRegion()).not.toBeInTheDocument();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onReveal).not.toHaveBeenCalled();
    });

    it("does the same for an ask line of another card", () => {
      const { onContinue } = renderCard(
        createCard(44, 56, { line: { pool: "halfway", index: 0 } }),
      );

      expect(queryRegion()).not.toBeInTheDocument();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it("leaves the same way when the reveal line does not exist", () => {
      const onReveal = vi.fn<CheckpointCardProps["onReveal"]>(() => ({
        pool: "axis-puzzle-hit",
        index: 99,
      }));
      const { onContinue } = renderCard(createCard(), onReveal);

      pick(END_NAME);

      expect(queryRegion()).not.toBeInTheDocument();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a card that cannot be read", () => {
    it("renders nothing, without throwing, and calls onContinue once", () => {
      const broken = {
        ...createCard(),
        end: undefined,
      } as unknown as AxisPuzzleCheckpointCard;
      const { onContinue } = renderCard(broken);

      expect(queryRegion()).not.toBeInTheDocument();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("given the app runs in English", () => {
    it("asks, reveals and describes the bar in English", () => {
      renderCard(createCard(), createReveal(), createI18n("en"));

      expect(getBar()).toHaveAccessibleName(
        `“${START_NAME}” and “${END_NAME}”: the reading is hidden`,
      );
      expect(screen.getByRole("group").getAttribute("aria-label")).not.toBe(
        ASK_STATEMENTS[0],
      );

      pick(END_NAME);

      expect(getBar()).toHaveAccessibleName(
        `“${START_NAME}” and “${END_NAME}”: you are closer to the “${END_NAME}” side`,
      );
      expect(getText()).toHaveTextContent(`“${END_NAME}”`);
    });
  });

  describe("when the language changes after the guess", () => {
    it("keeps the outcome and shows its line in the new language", () => {
      const { i18n, onReveal } = renderCard();

      pick(END_NAME);
      act(() => i18n.activate("en"));

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(queryButton(END_NAME)).not.toBeInTheDocument();
      expect(getText()).toHaveTextContent(`“${END_NAME}”`);
      expect(getText()).not.toHaveTextContent(HIT_LINES[0]);
    });
  });
});
