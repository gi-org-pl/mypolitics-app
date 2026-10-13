import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import {
  exampleOrientations,
  friendComparison,
} from "../ResultsComparison.fixtures";
import { AgreementBar } from "./AgreementBar";
import type { AgreementBarProps } from "./AgreementBar.types";

const friend = friendComparison.other.orientation;
const [orientation] = exampleOrientations;

const renderBar = (props: Partial<AgreementBarProps> = {}) => {
  const onEnd = vi.fn();

  renderWithI18n(
    <AgreementBar other={friend} score={95} onEnd={onEnd} {...props} />,
  );

  return { onEnd };
};

const getBar = () => within(screen.getByRole("region", { name: "Zgodność" }));

describe("<AgreementBar />", () => {
  describe("given a friend and a score", () => {
    it("names the other side in words, after what the bar is about", () => {
      renderBar();

      expect(screen.getByTestId("ranked-row-name")).toHaveTextContent(
        "Zgodność — Znajomy",
      );
    });

    it("says the score in words, and not by the fill of the bar alone", () => {
      renderBar();

      expect(
        getBar().getByRole("img", { name: "Znajomy: 95%" }),
      ).toBeInTheDocument();
      expect(getBar().getByText("95%")).toBeInTheDocument();
    });

    it("draws the score on a one-sided bar, capped with the image of the other side", () => {
      renderBar();

      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "95%",
      });
      expect(
        screen.queryByTestId("universal-axis-fill-end"),
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId("universal-axis-cap-start").querySelector("img"),
      ).toHaveAttribute("src", friend.imageUrl);
    });

    it("draws no marker and no comparison on the bar", () => {
      renderBar();

      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-comparison-image"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given an orientation", () => {
    it("names it, and draws the bar in its colour", () => {
      renderBar({ other: orientation, score: 60 });

      expect(screen.getByTestId("ranked-row-name")).toHaveTextContent(
        "Zgodność — Progresywizm",
      );
      expect(
        getBar().getByRole("img", { name: "Progresywizm: 60%" }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        "--axis-color": orientation.color,
      });
    });
  });

  describe("given no score", () => {
    it("draws the bar without a value, and says that there is none", () => {
      renderBar({ score: undefined });

      expect(
        getBar().getByRole("img", { name: "Brak wyniku" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("ranked-row-name")).toHaveTextContent(
        "Zgodność — Znajomy",
      );
    });
  });

  describe("given a score at either end", () => {
    it.each([0, 100])("draws %i%% in full", (score) => {
      renderBar({ score });

      expect(
        getBar().getByRole("img", { name: `Znajomy: ${score}%` }),
      ).toBeInTheDocument();
    });
  });

  describe("when the control that ends the comparison is pressed", () => {
    it("ends the comparison", () => {
      const { onEnd } = renderBar();

      fireEvent.click(
        getBar().getByRole("button", { name: "Cofnij porównanie" }),
      );

      expect(onEnd).toHaveBeenCalledTimes(1);
    });
  });

  describe("the layout", () => {
    it("is a container that stacks while narrow and puts the control beside the bar once both fit", () => {
      renderBar();

      const region = screen.getByRole("region", { name: "Zgodność" });

      expect(region).toHaveClass("@container", "w-full");
      expect(region.firstElementChild).toHaveClass(
        "flex-col",
        "@lg:flex-row",
        "@lg:justify-between",
      );
    });
  });
});
