import { i18n } from "@lingui/core";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import { DEFAULT_LANGUAGE } from "@/constants/common";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { SurveyQuestionExplanation } from "./SurveyQuestionExplanation";
import {
  EXPLANATION_PREVIEW_ELLIPSIS,
  EXPLANATION_TRIGGER_PHRASES,
} from "./SurveyQuestionExplanation.constants";

const TEST_LOCALE = "en";

const EXPLANATION =
  "Obraza uczuć religijnych to działanie lub wypowiedź, które znieważają wiarę.";
const PREVIEW = "Obraza uczuć religijnych to...";
const PLAIN_EXPLANATION = "Działanie lub wypowiedź, które znieważają wiarę.";
const FALLBACK = "Sprawdź wyjaśnienie";
const CHEVRON_TEST_ID = "survey-question-explanation-chevron";

const renderExplanation = (explanation: string = EXPLANATION) => {
  renderWithI18n(<SurveyQuestionExplanation explanation={explanation} />);

  return userEvent.setup();
};

const activateLocaleWithTrigger = (phrase: string) => {
  i18n.load(TEST_LOCALE, { [EXPLANATION_TRIGGER_PHRASES[0].id]: phrase });
  i18n.activate(TEST_LOCALE);
};

describe("<SurveyQuestionExplanation />", () => {
  afterEach(() => {
    cleanup();
    i18n.activate(DEFAULT_LANGUAGE);
  });

  describe("given an explanation with a trigger phrase", () => {
    it("shows the preview up to the trigger phrase", () => {
      renderExplanation();

      expect(screen.getByRole("button", { name: PREVIEW })).toBeVisible();
    });
  });

  describe("given an explanation that starts with the trigger phrase", () => {
    it("shows that word with an ellipsis", () => {
      renderExplanation("To umowa między państwami.");

      expect(screen.getByRole("button", { name: "To..." })).toBeVisible();
    });
  });

  describe("given an explanation without a trigger phrase", () => {
    it("shows the fallback text", () => {
      renderExplanation(PLAIN_EXPLANATION);

      expect(screen.getByRole("button", { name: FALLBACK })).toBeVisible();
    });
  });

  describe("given a trigger phrase only inside a longer word", () => {
    it("shows the fallback text", () => {
      renderExplanation("Autonomia regionów, które stoją osobno.");

      expect(screen.getByRole("button", { name: FALLBACK })).toBeVisible();
    });
  });

  describe("while collapsed", () => {
    it("reports itself as collapsed", () => {
      renderExplanation();

      expect(screen.getByRole("button", { name: PREVIEW })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("hides the full explanation from assistive technology", () => {
      renderExplanation();

      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
      expect(screen.getByRole("paragraph", { hidden: true })).toHaveTextContent(
        EXPLANATION,
      );
    });

    it("names the element it controls", () => {
      renderExplanation();

      const controlledId = screen
        .getByRole("button", { name: PREVIEW })
        .getAttribute("aria-controls");

      expect(controlledId).toBeTruthy();
      expect(
        screen.getByRole("paragraph", { hidden: true }).parentElement,
      ).toHaveAttribute("id", controlledId);
    });
  });

  describe("given the opening animation", () => {
    it("starts with the explanation faded out towards its bottom", () => {
      renderExplanation();

      expect(screen.getByRole("paragraph", { hidden: true })).toHaveClass(
        "mask-bottom",
      );
    });

    it("uncovers the whole explanation once the bar is open", async () => {
      const user = renderExplanation();

      await user.click(screen.getByRole("button", { name: PREVIEW }));

      expect(screen.getByRole("paragraph")).toHaveClass("mask-top");
      expect(screen.getByRole("paragraph")).not.toHaveClass("mask-bottom");
    });

    it("turns every transition off for reduced motion", () => {
      renderExplanation();

      const button = screen.getByRole("button", { name: PREVIEW });
      const explanation = screen.getByRole("paragraph", { hidden: true });
      const animated = [
        button.parentElement,
        button.firstElementChild,
        explanation.parentElement,
        explanation,
      ];

      expect(
        animated.map((element) =>
          element?.classList.contains("motion-reduce:transition-none"),
        ),
      ).toEqual([true, true, true, true]);
    });
  });

  describe("given a forced-colours mode", () => {
    it("keeps an outline on the focused bar for the system to paint", () => {
      renderExplanation();

      expect(screen.getByRole("button", { name: PREVIEW })).toHaveClass(
        "focus-visible:after:outline-2",
        "focus-visible:after:-outline-offset-2",
        "focus-visible:after:outline-transparent",
      );
    });

    it("draws the chevron in the system text colour", () => {
      renderExplanation();

      expect(screen.getByTestId(CHEVRON_TEST_ID)).toHaveClass(
        "forced-colors:bg-[ButtonText]",
      );
    });
  });

  describe("given the chevron", () => {
    it("is decorative", () => {
      renderExplanation();

      expect(screen.getByTestId(CHEVRON_TEST_ID)).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(screen.getByRole("button", { name: PREVIEW })).toContainElement(
        screen.getByTestId(CHEVRON_TEST_ID),
      );
    });

    it("is masked with the chevron icon, with the prefixed property as well", () => {
      renderExplanation();

      const { style } = screen.getByTestId(CHEVRON_TEST_ID);

      expect(style.mask).toContain(chevronDownIcon);
      expect(style).toHaveProperty("WebkitMask", style.mask);
    });
  });

  describe("when the bar is activated", () => {
    it("shows the full explanation", async () => {
      const user = renderExplanation();

      await user.click(screen.getByRole("button", { name: PREVIEW }));

      expect(screen.getByRole("paragraph")).toHaveTextContent(EXPLANATION);
    });

    it("reports itself as expanded", async () => {
      const user = renderExplanation();

      await user.click(screen.getByRole("button", { name: PREVIEW }));

      expect(screen.getByRole("button", { name: PREVIEW })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });
  });

  describe("when the bar is activated again", () => {
    it("returns to the preview", async () => {
      const user = renderExplanation();

      await user.click(screen.getByRole("button", { name: PREVIEW }));
      await user.click(screen.getByRole("button", { name: PREVIEW }));

      expect(screen.getByRole("button", { name: PREVIEW })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    });
  });

  describe("when the focused bar gets Enter", () => {
    it("opens, then collapses", async () => {
      const user = renderExplanation();

      await user.tab();
      expect(screen.getByRole("button", { name: PREVIEW })).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(screen.getByRole("paragraph")).toHaveTextContent(EXPLANATION);

      await user.keyboard("{Enter}");
      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    });
  });

  describe("when the focused bar gets Space", () => {
    it("opens, then collapses", async () => {
      const user = renderExplanation();

      await user.tab();
      await user.keyboard(" ");
      expect(screen.getByRole("paragraph")).toHaveTextContent(EXPLANATION);

      await user.keyboard(" ");
      expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    });
  });

  describe("given a locale that translates the trigger phrase", () => {
    it("cuts the preview at the phrase of that locale", () => {
      activateLocaleWithTrigger("is");
      renderExplanation("A concordat is a treaty with the Holy See.");

      expect(
        screen.getByRole("button", { name: "A concordat is..." }),
      ).toBeVisible();
    });
  });

  describe("given a locale with a blank trigger phrase", () => {
    it("shows the fallback text", () => {
      activateLocaleWithTrigger(" ");
      renderExplanation();

      expect(screen.getByRole("button", { name: FALLBACK })).toBeVisible();
    });
  });

  describe("given a locale that translates the ellipsis", () => {
    it("ends the preview with the ellipsis of that locale", () => {
      i18n.load(TEST_LOCALE, {
        [EXPLANATION_TRIGGER_PHRASES[0].id]: "is",
        [EXPLANATION_PREVIEW_ELLIPSIS.id]: "…",
      });
      i18n.activate(TEST_LOCALE);
      renderExplanation("A concordat is a treaty with the Holy See.");

      expect(
        screen.getByRole("button", { name: "A concordat is…" }),
      ).toBeVisible();
    });
  });
});
