import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyCategorySelectPrompt } from "./SurveyCategorySelectPrompt";

describe("<SurveyCategorySelectPrompt />", () => {
  describe("given no prompt", () => {
    it.each([
      [1, "Wybierz 1 najważniejszy dla Ciebie temat."],
      [2, "Wybierz 2 najważniejsze dla Ciebie tematy."],
      [3, "Wybierz 3 najważniejsze dla Ciebie tematy."],
      [5, "Wybierz 5 najważniejszych dla Ciebie tematów."],
      [12, "Wybierz 12 najważniejszych dla Ciebie tematów."],
      [21, "Wybierz 21 najważniejszych dla Ciebie tematów."],
      [22, "Wybierz 22 najważniejsze dla Ciebie tematy."],
    ])("renders the default sentence in the right form for %d", (count, sentence) => {
      renderWithI18n(<SurveyCategorySelectPrompt id="prompt" count={count} />);

      expect(screen.getByText(sentence)).toBeInTheDocument();
    });
  });

  describe("given a prompt", () => {
    it("renders it instead of the default sentence", () => {
      renderWithI18n(
        <SurveyCategorySelectPrompt
          id="prompt"
          count={3}
          prompt={<span>Wybierz tematy, które Cię interesują.</span>}
        />,
      );

      expect(
        screen.getByText("Wybierz tematy, które Cię interesują."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/najważniejsze/)).not.toBeInTheDocument();
    });
  });

  describe("given an id", () => {
    it("puts it on the card, so the list can be labelled by the prompt", () => {
      renderWithI18n(<SurveyCategorySelectPrompt id="prompt" count={3} />);

      expect(
        screen.getByText("Wybierz 3 najważniejsze dla Ciebie tematy."),
      ).toHaveAttribute("id", "prompt");
    });
  });
});
