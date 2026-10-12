import { type I18n, setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MATCH_BAND_COLORS } from "@/constants/results";
import { messages as enMessages } from "@/locales/en/messages";
import { messages as plMessages } from "@/locales/pl/messages";
import type {
  CheckpointCardProps,
  CheckpointLine,
  PositionPuzzleCheckpointCard,
} from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { SurveyCheckpointPositionPuzzle } from "./SurveyCheckpointPositionPuzzle";
import { HIDDEN_BAR_COLOR } from "./SurveyCheckpointPositionPuzzle.constants";

const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const LEADER_NAME = "Zielony postępowiec";
const SECOND_NAME = "Narodowy konserwatysta";
const THIRD_NAME = "Suwerenny patriota";
const LEADER_IMAGE = "https://example.com/green.png";
const LEADER_COLOR = "#e91e63";
const HIDDEN = "Ukryta postać jest blisko Ciebie";
const REVEALED = `${LEADER_NAME} jest blisko Ciebie`;
const PLACEHOLDER = "survey-checkpoint-position-puzzle-placeholder";

// The lines of the three pools, in the order the pools hold them, with the
// name of the leader of the cards below in its slot.
const ASK_STATEMENTS = [
  "Do jednej z opcji jest Tobie bardzo blisko, zgadnij do której!",
  "Jedna z tych postaci jest teraz najbliżej Twoich odpowiedzi. Która?",
  "Tylko do jednej z tych opcji jest Ci naprawdę blisko. Wskaż ją!",
];
const ASK_LINES = [
  `Jak myślisz? — ${ASK_STATEMENTS[0]}`,
  `Zgadnij, kto to — ${ASK_STATEMENTS[1]}`,
  `Czas na typowanie — ${ASK_STATEMENTS[2]}`,
];
const HIT_LINES = [
  `Trafione! — ${LEADER_NAME} jest do Ciebie bardzo blisko na tym etapie quizu.`,
  `Jest! — Na tym etapie quizu najbliżej Ciebie jest ${LEADER_NAME}.`,
  `Dobre oko — Postać najbliższa Twoim odpowiedziom to jak dotąd ${LEADER_NAME}.`,
];
const MISS_LINES = [
  "Pudło! — Ktoś inny jest Tobie najbliższy. Kto? Teraz nie powiemy!",
  "Nie tym razem — Najbliżej Ciebie jest inna postać. Która? To się okaże w wynikach.",
  "Zagadka trwa — To nie ta opcja. Kto jest najbliżej? Odpowiedź czeka w wynikach.",
];

// The catalogs of the app, as `root.tsx` loads them.
const createI18n = (locale: "pl" | "en" = "pl"): I18n =>
  setupI18n({ locale, messages: { en: enMessages, pl: plMessages } });

// Every archetype has a colour of its own, which the card must never show.
const LEADER = createOrientation("green", LEADER_NAME, {
  type: "identity",
  imageUrl: LEADER_IMAGE,
  color: LEADER_COLOR,
});
const SECOND = createOrientation("national", SECOND_NAME, {
  type: "identity",
  imageUrl: "https://example.com/national.png",
  color: "#3f51b5",
});
const THIRD = createOrientation("sovereign", THIRD_NAME, {
  type: "identity",
  imageUrl: "https://example.com/sovereign.png",
  color: "#ff5722",
});
const FOURTH = createOrientation("liberal", "Wolnorynkowy liberał", {
  type: "identity",
});

// The card of the Figma frames, with the leader in the middle row.
const createCard = (
  closeness = 79,
  overrides: Partial<PositionPuzzleCheckpointCard> = {},
): PositionPuzzleCheckpointCard => ({
  type: "position-puzzle",
  boundary: 5,
  leader: LEADER,
  closeness,
  options: [SECOND, LEADER, THIRD],
  line: { pool: "position-puzzle-ask", index: 0 },
  ...overrides,
});

const withoutImage = (orientation: Orientation): Orientation => ({
  ...orientation,
  imageUrl: undefined,
});

// `onReveal` as the phase gives it: a line of the hit or the miss pool, by
// its place in the pool.
const createReveal = (index = 0) =>
  vi.fn<CheckpointCardProps["onReveal"]>(
    (outcome): CheckpointLine => ({
      pool: outcome === "hit" ? "position-puzzle-hit" : "position-puzzle-miss",
      index,
    }),
  );

const renderCard = (
  card: PositionPuzzleCheckpointCard = createCard(),
  onReveal: CheckpointCardProps["onReveal"] = createReveal(),
  i18n: I18n = createI18n(),
) => {
  const onContinue = vi.fn();
  const onOptOut = vi.fn();

  return {
    ...render(
      <I18nProvider i18n={i18n}>
        <SurveyCheckpointPositionPuzzle
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

const getFill = () => screen.getByTestId("universal-axis-fill-start");

const getCap = () => screen.getByTestId("universal-axis-cap-start");

const getBarColor = (): string =>
  getFill().style.getPropertyValue("--axis-color");

const getRowImages = () =>
  screen.getAllByTestId("survey-checkpoint-options-image");

const pick = (name: string) => fireEvent.click(getButton(name));

// The whole of an asking card, as a miss has to leave it.
const expectHiddenVisual = (closeness = "79%") => {
  expect(screen.getByTestId(PLACEHOLDER)).toBeInTheDocument();
  expect(getFill()).toHaveStyle({ width: closeness });
  expect(getBarColor()).toBe(HIDDEN_BAR_COLOR);
  expect(getCap().style.getPropertyValue("--axis-color")).toBe(
    HIDDEN_BAR_COLOR,
  );
  expect(getCap()).toBeEmptyDOMElement();
  expect(getBar()).toHaveAccessibleName(HIDDEN);
};

describe("<SurveyCheckpointPositionPuzzle />", () => {
  describe("given a card, before a guess", () => {
    it("renders one checkpoint frame with the placeholder, the masked bar and the ask line", () => {
      renderCard();

      expect(screen.getAllByRole("region")).toHaveLength(1);
      expect(getRegion()).toBeVisible();
      expect(within(getRegion()).getAllByRole("img")).toHaveLength(1);
      expect(screen.getByTestId(PLACEHOLDER)).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(getBarColor()).toBe(HIDDEN_BAR_COLOR);
      expect(getText()).toHaveTextContent(ASK_LINES[0]);
    });

    it("shows the ask line the card carries", () => {
      const { unmount } = renderCard(
        createCard(79, { line: { pool: "position-puzzle-ask", index: 1 } }),
      );

      expect(getText()).toHaveTextContent(ASK_LINES[1]);

      unmount();
      renderCard(
        createCard(79, { line: { pool: "position-puzzle-ask", index: 2 } }),
      );

      expect(getText()).toHaveTextContent(ASK_LINES[2]);
    });

    it("fills the bar to the closeness of the card, with no number", () => {
      const { container, unmount } = renderCard(createCard(79));

      expect(getFill()).toHaveStyle({ width: "79%" });
      expect(screen.queryByTestId(/universal-axis-value/)).toBeNull();
      expect(screen.queryByTestId("universal-axis-marker")).toBeNull();
      expect(container.textContent).not.toMatch(/[\d%]/);
      expect(getBar().getAttribute("aria-label")).not.toMatch(/[\d%]/);

      unmount();
      renderCard(createCard(63.5));

      expect(getFill()).toHaveStyle({ width: "63.5%" });
    });

    it("does not hatch the bar: the fill is the one thing shown", () => {
      renderCard();

      expect(screen.queryByTestId("universal-axis-mask")).toBeNull();
      expect(screen.queryByTestId("universal-axis-fill-end")).toBeNull();
      expect(screen.queryByTestId("universal-axis-cap-end")).toBeNull();
      expect(screen.queryByTestId("universal-axis-labels")).toBeNull();
    });

    it("draws no image on the cap", () => {
      const { container } = renderCard();

      expect(getCap()).toBeEmptyDOMElement();
      expect(getCap().style.getPropertyValue("--axis-color")).toBe(
        HIDDEN_BAR_COLOR,
      );
      expect(container.querySelector("img")).toBeNull();
      // The image of the leader is on its row, as the images of the other
      // two are on theirs, and nowhere on the bar.
      expect(getBar().innerHTML).not.toContain(LEADER_IMAGE);
    });

    it("shows neither the leader's colour nor the colour of its band", () => {
      const { container, unmount } = renderCard(createCard(79));

      expect(container.innerHTML).not.toContain(LEADER_COLOR);
      expect(container.innerHTML).not.toContain(MATCH_BAND_COLORS.partial);

      unmount();

      const match = renderCard(createCard(92));

      expect(match.container.innerHTML).not.toContain(MATCH_BAND_COLORS.match);
      expect(getBarColor()).toBe(HIDDEN_BAR_COLOR);
    });

    it("offers the three options in the order of the card", () => {
      const { unmount } = renderCard();

      expect(
        within(screen.getByRole("group"))
          .getAllByRole("button")
          .map((row) => row.textContent),
      ).toEqual([SECOND_NAME, LEADER_NAME, THIRD_NAME]);

      unmount();
      renderCard(createCard(79, { options: [THIRD, SECOND, LEADER] }));

      expect(getButtonNames()).toEqual([
        THIRD_NAME,
        SECOND_NAME,
        LEADER_NAME,
        CONTINUE,
        OPT_OUT,
      ]);
    });

    it("draws the three rows alike: nothing marks the leader", () => {
      renderCard();

      const [first, second, third] = within(screen.getByRole("group"))
        .getAllByRole("button")
        .map((row) => row.className);

      expect(second).toBe(first);
      expect(third).toBe(first);
      expect(new Set(getRowImages().map((image) => image.className)).size).toBe(
        1,
      );
    });

    it("names the group of options by the statement", () => {
      renderCard();

      expect(screen.getByRole("group")).toHaveAccessibleName(ASK_STATEMENTS[0]);
    });

    it('renders "Dalej" and "Wyłącz checkpointy"', () => {
      renderCard();

      expect(getButton(CONTINUE)).toBeVisible();
      expect(getButton(OPT_OUT)).toBeVisible();
    });

    it("describes the bar as a hidden character", () => {
      renderCard();

      expect(getBar()).toHaveAccessibleName(HIDDEN);
    });

    it("has the leader's name on its row and nowhere else", () => {
      renderCard();

      expect(within(getRegion()).getAllByText(LEADER_NAME)).toHaveLength(1);
      expect(getText()).not.toHaveTextContent(LEADER_NAME);
    });

    it('reaches the options, then "Dalej", then "Wyłącz checkpointy" with the Tab key', async () => {
      const user = userEvent.setup();

      renderCard();

      await user.tab();
      expect(getButton(SECOND_NAME)).toHaveFocus();

      await user.tab();
      expect(getButton(LEADER_NAME)).toHaveFocus();

      await user.tab();
      expect(getButton(THIRD_NAME)).toHaveFocus();

      await user.tab();
      expect(getButton(CONTINUE)).toHaveFocus();

      await user.tab();
      expect(getButton(OPT_OUT)).toHaveFocus();
    });

    it("takes a guess from the keyboard", async () => {
      const user = userEvent.setup();
      const { onReveal } = renderCard();

      await user.tab();
      await user.tab();
      await user.keyboard("{Enter}");

      expect(onReveal).toHaveBeenCalledWith("hit");
    });

    it("calls nothing by itself", () => {
      const { onReveal, onContinue, onOptOut } = renderCard();

      expect(onReveal).not.toHaveBeenCalled();
      expect(onContinue).not.toHaveBeenCalled();
      expect(onOptOut).not.toHaveBeenCalled();
    });
  });

  describe("when the leader is picked", () => {
    it('calls onReveal once with "hit"', () => {
      const { onReveal } = renderCard();

      pick(LEADER_NAME);

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReveal).toHaveBeenCalledWith("hit");
    });

    it("shows the leader's name over the bar in place of the placeholder", () => {
      renderCard();

      pick(LEADER_NAME);

      const name = within(getRegion()).getByText(LEADER_NAME, { exact: true });

      expect(name).toBeVisible();
      expect(screen.queryByTestId(PLACEHOLDER)).not.toBeInTheDocument();
      expect(
        name.compareDocumentPosition(getBar()) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        name.compareDocumentPosition(getText()) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("draws the leader's image on the cap", () => {
      renderCard();

      pick(LEADER_NAME);

      expect(getCap().querySelector("img")).toHaveAttribute(
        "src",
        LEADER_IMAGE,
      );
    });

    it("keeps the length of the bar", () => {
      renderCard(createCard(63.5));

      pick(LEADER_NAME);

      expect(getFill()).toHaveStyle({ width: "63.5%" });
    });

    it("colours the bar by its band and not by the leader's own colour", () => {
      const { container } = renderCard(createCard(79));

      pick(LEADER_NAME);

      expect(getBarColor()).toBe(MATCH_BAND_COLORS.partial);
      expect(getCap().style.getPropertyValue("--axis-color")).toBe(
        MATCH_BAND_COLORS.partial,
      );
      expect(container.innerHTML).not.toContain(LEADER_COLOR);
      expect(container.innerHTML).not.toContain(HIDDEN_BAR_COLOR);
    });

    it("shows the hit line with the name of the leader", () => {
      const { unmount } = renderCard();

      pick(LEADER_NAME);

      expect(getText()).toHaveTextContent(HIT_LINES[0]);

      unmount();
      renderCard(createCard(), createReveal(2));
      pick(LEADER_NAME);

      expect(getText()).toHaveTextContent(HIT_LINES[2]);
    });

    it("describes the bar by the leader's name, with no number", () => {
      renderCard();

      pick(LEADER_NAME);

      expect(getBar()).toHaveAccessibleName(REVEALED);
      expect(getBar().getAttribute("aria-label")).not.toMatch(/[\d%]/);
      expect(getRegion().textContent).not.toMatch(/[\d%]/);
      expect(screen.queryByTestId(/universal-axis-value/)).toBeNull();
      expect(screen.queryByTestId("universal-axis-marker")).toBeNull();
    });

    it("removes the options", () => {
      renderCard();

      pick(LEADER_NAME);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
      expect(queryButton(LEADER_NAME)).not.toBeInTheDocument();
      expect(queryButton(SECOND_NAME)).not.toBeInTheDocument();
      expect(queryButton(THIRD_NAME)).not.toBeInTheDocument();
      expect(getButtonNames()).toEqual([CONTINUE, OPT_OUT]);
    });

    it("has the focus on the text of the card", async () => {
      const user = userEvent.setup();

      renderCard();

      await user.click(getButton(LEADER_NAME));

      expect(getText()).toHaveFocus();

      await user.tab();

      expect(getButton(CONTINUE)).toHaveFocus();
    });
  });

  describe("when another option is picked", () => {
    it('calls onReveal once with "miss"', () => {
      const { onReveal, unmount } = renderCard();

      pick(SECOND_NAME);

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReveal).toHaveBeenCalledWith("miss");

      unmount();

      const other = renderCard();

      pick(THIRD_NAME);

      expect(other.onReveal).toHaveBeenCalledTimes(1);
      expect(other.onReveal).toHaveBeenCalledWith("miss");
    });

    it("shows the miss line", () => {
      const { unmount } = renderCard();

      pick(SECOND_NAME);

      expect(getText()).toHaveTextContent(MISS_LINES[0]);

      unmount();
      renderCard(createCard(), createReveal(1));
      pick(THIRD_NAME);

      expect(getText()).toHaveTextContent(MISS_LINES[1]);
    });

    it("keeps the placeholder, the neutral bar and the cap without an image", () => {
      renderCard();

      const asked = getRegion().firstElementChild?.innerHTML;

      pick(SECOND_NAME);

      expectHiddenVisual();
      expect(getRegion().firstElementChild?.innerHTML).toBe(asked);
    });

    it("has the leader's name and image nowhere in the document", () => {
      for (const index of [0, 1, 2]) {
        const { unmount } = renderCard(createCard(92), createReveal(index));

        pick(THIRD_NAME);

        expect(document.body.textContent).not.toContain(LEADER_NAME);
        expect(document.body.innerHTML).not.toContain(LEADER_NAME);
        expect(document.body.innerHTML).not.toContain(LEADER_IMAGE);
        expect(document.body.innerHTML).not.toContain(LEADER.id);
        expect(document.body.innerHTML).not.toContain(LEADER_COLOR);
        expect(document.body.innerHTML).not.toContain(MATCH_BAND_COLORS.match);
        expect(document.querySelector("img")).toBeNull();

        unmount();
      }
    });

    it("still describes the bar as a hidden character", () => {
      renderCard();

      pick(SECOND_NAME);

      expect(getBar()).toHaveAccessibleName(HIDDEN);
    });

    it("removes the options and does not mark or repeat the picked one", () => {
      renderCard();

      pick(SECOND_NAME);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
      expect(getButtonNames()).toEqual([CONTINUE, OPT_OUT]);
      expect(document.body.textContent).not.toContain(SECOND_NAME);
      expect(document.body.textContent).not.toContain(THIRD_NAME);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("has the focus on the text of the card", async () => {
      const user = userEvent.setup();

      renderCard();

      await user.click(getButton(THIRD_NAME));

      expect(getText()).toHaveFocus();

      await user.tab();

      expect(getButton(CONTINUE)).toHaveFocus();
    });
  });

  describe('when "Dalej" is activated before a guess', () => {
    it("calls onContinue once and never calls onReveal", () => {
      const { onReveal, onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(CONTINUE));

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onReveal).not.toHaveBeenCalled();
      expect(onOptOut).not.toHaveBeenCalled();
      expectHiddenVisual();
    });
  });

  describe('when "Wyłącz checkpointy" is activated before a guess', () => {
    it("calls onOptOut once and never calls onReveal", () => {
      const { onReveal, onContinue, onOptOut } = renderCard();

      fireEvent.click(getButton(OPT_OUT));

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onReveal).not.toHaveBeenCalled();
      expect(onContinue).not.toHaveBeenCalled();
      expectHiddenVisual();
    });
  });

  describe('when "Dalej" or "Wyłącz checkpointy" is activated after the guess', () => {
    it("calls onContinue once", () => {
      const { onContinue, onOptOut } = renderCard();

      pick(LEADER_NAME);
      fireEvent.click(getButton(CONTINUE));

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });

    it("calls onOptOut once", () => {
      const { onContinue, onOptOut } = renderCard();

      pick(SECOND_NAME);
      fireEvent.click(getButton(OPT_OUT));

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("when an option is picked twice in a row", () => {
    it("calls onReveal once", () => {
      const { onReveal } = renderCard();
      const option = getButton(SECOND_NAME);
      const leader = getButton(LEADER_NAME);

      act(() => {
        option.click();
        option.click();
        leader.click();
      });

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReveal).toHaveBeenCalledWith("miss");
      expect(getText()).toHaveTextContent(MISS_LINES[0]);
      expectHiddenVisual();
    });
  });

  describe("when onReveal gives no line", () => {
    it("calls onContinue once", () => {
      const onReveal = vi.fn<CheckpointCardProps["onReveal"]>();
      const { onContinue, onOptOut } = renderCard(createCard(), onReveal);

      pick(LEADER_NAME);
      pick(SECOND_NAME);

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
      // Nothing was revealed: the card still asks.
      expectHiddenVisual();
    });
  });

  describe("when the card is mounted again", () => {
    it("asks again, with the same bar and the same three options", () => {
      const card = createCard();
      const first = renderCard(card);
      const markup = first.container.innerHTML;

      pick(LEADER_NAME);
      first.unmount();

      const second = renderCard(card);

      expect(second.container.innerHTML).toBe(markup);
      expect(getText()).toHaveTextContent(ASK_LINES[0]);
      expect(getButtonNames()).toEqual([
        SECOND_NAME,
        LEADER_NAME,
        THIRD_NAME,
        CONTINUE,
        OPT_OUT,
      ]);
      expectHiddenVisual();

      pick(THIRD_NAME);

      expect(second.onReveal).toHaveBeenCalledWith("miss");
    });
  });

  describe("given a leader with a closeness of 80 or more", () => {
    it("uses the match colour on a hit", () => {
      for (const closeness of [80, 86, 100]) {
        const { unmount } = renderCard(createCard(closeness));

        pick(LEADER_NAME);

        expect(getBarColor()).toBe(MATCH_BAND_COLORS.match);

        unmount();
      }
    });
  });

  describe("given a leader with a closeness from 50 up to 80", () => {
    it("uses the partial match colour on a hit", () => {
      for (const closeness of [50, 64, 79.99]) {
        const { unmount } = renderCard(createCard(closeness));

        pick(LEADER_NAME);

        expect(getBarColor()).toBe(MATCH_BAND_COLORS.partial);

        unmount();
      }
    });
  });

  describe("given a closeness above 100", () => {
    it("lets the bar clamp it", () => {
      renderCard(createCard(140));

      expect(getFill()).toHaveStyle({ width: "100%" });

      pick(LEADER_NAME);

      expect(getFill()).toHaveStyle({ width: "100%" });
      expect(getBarColor()).toBe(MATCH_BAND_COLORS.match);
    });
  });

  describe("given archetypes without images", () => {
    const createBareCard = () =>
      createCard(79, {
        leader: withoutImage(LEADER),
        options: [SECOND, LEADER, THIRD].map(withoutImage),
      });

    it("shows the neutral placeholder in each row", () => {
      renderCard(createBareCard());

      expect(getRowImages()).toHaveLength(3);

      for (const image of getRowImages()) {
        expect(image).toHaveClass("bg-gi-dark-gray");
        expect(image).not.toHaveAttribute("style");
      }
    });

    it("shows the bar's colour alone on the cap after a hit", () => {
      const { container } = renderCard(createBareCard());

      pick(LEADER_NAME);

      expect(getCap()).toBeEmptyDOMElement();
      expect(getCap().style.getPropertyValue("--axis-color")).toBe(
        MATCH_BAND_COLORS.partial,
      );
      expect(container.querySelector("img")).toBeNull();
      expect(within(getRegion()).getByText(LEADER_NAME)).toBeVisible();
    });
  });

  describe("given options that have colours", () => {
    it("shows no archetype's own colour in a row", () => {
      const { container } = renderCard();

      for (const image of getRowImages()) {
        expect(image).toHaveClass("bg-gi-dark-gray");
        expect(image.style.backgroundColor).toBe("");
        expect(image.style.backgroundImage).toContain("https://example.com/");
      }

      for (const { color } of [LEADER, SECOND, THIRD]) {
        expect(container.innerHTML).not.toContain(color);
      }
    });
  });

  describe("given a name with line breaks, or longer than the room over the bar", () => {
    it("puts it on one line and never cuts it, in the row and over the bar", () => {
      const name = `Zielony \n postępowiec  ${"o bardzo długiej nazwie ".repeat(6)}autorskiej`;
      const shown = name.replace(/\s+/g, " ");
      const leader = { ...LEADER, name };

      renderCard(createCard(79, { leader, options: [SECOND, leader, THIRD] }));

      expect(getButton(shown)).toBeVisible();

      pick(shown);

      const over = within(getRegion()).getAllByText(shown, { exact: true })[0];

      expect(over).toHaveClass("wrap-break-word");
      expect(over.className).not.toMatch(
        /truncate|line-clamp|whitespace-nowrap|overflow-hidden/,
      );
      expect(getBar()).toHaveAccessibleName(`${shown} jest blisko Ciebie`);
    });
  });

  describe("given two options, four options, or a leader that is not among them", () => {
    it("renders nothing and calls onContinue once", () => {
      for (const options of [
        [SECOND, LEADER],
        [SECOND, LEADER, THIRD, FOURTH],
        [SECOND, THIRD, FOURTH],
      ]) {
        const { onContinue, onReveal, onOptOut, unmount } = renderCard(
          createCard(79, { options }),
        );

        expect(queryRegion()).not.toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(onContinue).toHaveBeenCalledTimes(1);
        expect(onReveal).not.toHaveBeenCalled();
        expect(onOptOut).not.toHaveBeenCalled();

        unmount();
      }
    });
  });

  describe("given a row, or the leader, without a name", () => {
    it("renders nothing and calls onContinue once", () => {
      const nameless = { ...LEADER, name: " \n " };

      for (const overrides of [
        { options: [{ ...SECOND, name: undefined }, LEADER, THIRD] },
        { options: [SECOND, LEADER, { ...THIRD, name: "  " }] },
        { leader: nameless, options: [SECOND, nameless, THIRD] },
      ]) {
        const { onContinue, unmount } = renderCard(createCard(79, overrides));

        expect(queryRegion()).not.toBeInTheDocument();
        expect(onContinue).toHaveBeenCalledTimes(1);

        unmount();
      }
    });
  });

  describe("given a closeness under 50", () => {
    it("renders nothing and calls onContinue once", () => {
      for (const closeness of [49.99, 0, Number.NaN]) {
        const { onContinue, onReveal, unmount } = renderCard(
          createCard(closeness),
        );

        expect(queryRegion()).not.toBeInTheDocument();
        expect(onContinue).toHaveBeenCalledTimes(1);
        expect(onReveal).not.toHaveBeenCalled();

        unmount();
      }
    });
  });

  describe("given a line that does not exist in the pools", () => {
    it("renders nothing and calls onContinue once", () => {
      const { onContinue, onReveal } = renderCard(
        createCard(79, { line: { pool: "position-puzzle-ask", index: 99 } }),
      );

      expect(queryRegion()).not.toBeInTheDocument();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onReveal).not.toHaveBeenCalled();
    });

    it("does the same for an ask line of another card", () => {
      const { onContinue } = renderCard(
        createCard(79, { line: { pool: "axis-puzzle-ask", index: 0 } }),
      );

      expect(queryRegion()).not.toBeInTheDocument();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it("leaves the same way when the reveal line does not exist", () => {
      const onReveal = vi.fn<CheckpointCardProps["onReveal"]>(() => ({
        pool: "position-puzzle-hit",
        index: 99,
      }));
      const { onContinue } = renderCard(createCard(), onReveal);

      pick(LEADER_NAME);

      expect(queryRegion()).not.toBeInTheDocument();
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a card that cannot be read", () => {
    it("renders nothing, without throwing, and calls onContinue once", () => {
      for (const overrides of [{ options: undefined }, { leader: undefined }]) {
        const broken = {
          ...createCard(),
          ...overrides,
        } as unknown as PositionPuzzleCheckpointCard;
        const { onContinue, unmount } = renderCard(broken);

        expect(queryRegion()).not.toBeInTheDocument();
        expect(onContinue).toHaveBeenCalledTimes(1);

        unmount();
      }
    });
  });

  describe("given the app runs in English", () => {
    it("asks, reveals and describes the bar in English", () => {
      renderCard(createCard(), createReveal(), createI18n("en"));

      expect(getBar()).toHaveAccessibleName(
        "A hidden character is close to you",
      );
      expect(screen.getByRole("group").getAttribute("aria-label")).not.toBe(
        ASK_STATEMENTS[0],
      );
      expect(screen.getByRole("group")).toHaveAccessibleName(
        getText().textContent?.split("— ")[1],
      );

      pick(LEADER_NAME);

      expect(getBar()).toHaveAccessibleName(`${LEADER_NAME} is close to you`);
      expect(getText()).toHaveTextContent(LEADER_NAME);
      expect(getText()).not.toHaveTextContent(HIT_LINES[0]);
    });
  });

  describe("when the language changes after the guess", () => {
    it("keeps the outcome and shows its line in the new language", () => {
      const { i18n, onReveal } = renderCard();

      pick(LEADER_NAME);
      act(() => i18n.activate("en"));

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(queryButton(LEADER_NAME)).not.toBeInTheDocument();
      expect(getText()).toHaveTextContent(LEADER_NAME);
      expect(getText()).not.toHaveTextContent(HIT_LINES[0]);
      expect(getBar()).toHaveAccessibleName(`${LEADER_NAME} is close to you`);
    });
  });
});
