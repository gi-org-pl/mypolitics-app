import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeaturesList } from "./FeaturesList";
import type { Feature } from "./FeaturesList.types";

const FEATURES: Feature[] = [
  { title: "+4 000 000 osób", description: "Pomogliśmy milionom." },
  { title: "Nikt nas nie finansuje", description: "Tworzą nas wolontariusze." },
];

const getCardTitles = () =>
  screen
    .getAllByRole("listitem")
    .map((item) => within(item).getByRole("heading").textContent);

describe("<FeaturesList />", () => {
  describe("when it gets features", () => {
    it("renders one card per feature, in the given order", () => {
      render(<FeaturesList features={FEATURES} />);

      expect(getCardTitles()).toEqual(FEATURES.map(({ title }) => title));
    });

    it("passes the description of each feature to its card", () => {
      render(<FeaturesList features={FEATURES} />);

      const [first, second] = screen.getAllByRole("article");

      expect(within(first).getByText("Pomogliśmy milionom.")).toBeVisible();
      expect(
        within(second).getByText("Tworzą nas wolontariusze."),
      ).toBeVisible();
    });
  });

  describe("when two features share a title", () => {
    it("renders both", () => {
      render(<FeaturesList features={[FEATURES[0], FEATURES[0]]} />);

      expect(screen.getAllByRole("article")).toHaveLength(2);
    });
  });

  describe("when the list of features is empty", () => {
    it("renders an empty list", () => {
      render(<FeaturesList features={[]} />);

      expect(screen.getByRole("list")).toBeEmptyDOMElement();
    });
  });
});
