import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HATCH_CLASS_NAME } from "@/constants/hatch";
import type { AxisOrientation } from "@/types/axis";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { Traits } from "./Traits";

const proChoice: AxisOrientation = {
  id: "pro-choice",
  name: "Pro-choice",
  imageUrl: "https://example.com/pro-choice.svg",
  color: "#851c22",
};
const proEuro: AxisOrientation = {
  id: "pro-euro",
  name: "Pro-Euro",
  imageUrl: "https://example.com/pro-euro.svg",
  color: "#b69d59",
};
const anarchism: AxisOrientation = {
  id: "anarchism",
  name: "Anarchizm",
  imageUrl: "https://example.com/anarchism.svg",
  color: "#192430",
};
const monarchism: AxisOrientation = {
  id: "monarchism",
  name: "Monarchizm",
  imageUrl: "https://example.com/monarchism.svg",
  color: "#9b51e0",
};

const traits = [proChoice, proEuro, anarchism, monarchism];

const friend: AxisOrientation = {
  id: "friend",
  name: "Ania",
  imageUrl: "https://example.com/ania.png",
};

const EMPTY_LINE = "Brak zdobytych cech";

const getPill = (name: string) => {
  const pill = screen
    .getAllByTestId("trait-pill")
    .find((item) => within(item).queryByText(name));

  if (!pill) throw new Error(`No pill named ${name}`);

  return pill;
};

const getBody = (name: string) =>
  within(getPill(name)).getByTestId("trait-pill-body");

const queryAvatar = (name: string) =>
  within(getPill(name)).queryByTestId("trait-pill-avatar");

describe("<Traits />", () => {
  describe("given traits", () => {
    it("renders one pill per trait, with its icon and name", () => {
      renderWithI18n(
        <Traits
          title="Cechy"
          traits={traits}
          earnedIds={["monarchism", "anarchism", "pro-choice"]}
        />,
      );

      const pills = screen.getAllByTestId("trait-pill");

      expect(pills.map((pill) => pill.textContent)).toEqual([
        "Pro-choice",
        "Anarchizm",
        "Monarchizm",
      ]);
      expect(
        within(getPill("Anarchizm")).getByTestId("trait-pill-image"),
      ).toHaveAttribute("src", anarchism.imageUrl);
      expect(getBody("Anarchizm").style.getPropertyValue("--trait-color")).toBe(
        "#192430",
      );
      expect(screen.getByRole("heading", { name: "Cechy" })).toBeVisible();
    });

    it("renders the pills as a list", () => {
      renderWithI18n(
        <Traits traits={traits} earnedIds={["anarchism", "monarchism"]} />,
      );

      const list = screen.getByRole("list");

      expect(within(list).getAllByRole("listitem")).toHaveLength(2);
      expect(list).toHaveClass("flex", "flex-wrap");
    });

    it("renders a pill without an icon with the name alone", () => {
      renderWithI18n(
        <Traits
          traits={[{ ...anarchism, imageUrl: undefined }]}
          earnedIds={["anarchism"]}
        />,
      );

      expect(screen.getByText("Anarchizm")).toBeInTheDocument();
      expect(screen.queryByTestId("trait-pill-image")).not.toBeInTheDocument();
    });

    it("does not make the pills interactive", () => {
      renderWithI18n(<Traits traits={traits} earnedIds={["anarchism"]} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(getPill("Anarchizm")).not.toHaveAttribute("tabindex");
    });

    it("draws a trait listed twice once and skips one without a name", () => {
      renderWithI18n(
        <Traits
          traits={[anarchism, anarchism, { ...proEuro, name: " " }]}
          earnedIds={["anarchism", "pro-euro", "unknown"]}
        />,
      );

      expect(screen.getAllByTestId("trait-pill")).toHaveLength(1);
    });
  });

  describe("given a comparison", () => {
    const renderComparison = (party: AxisOrientation = friend) =>
      renderWithI18n(
        <Traits
          traits={traits}
          earnedIds={["pro-choice", "anarchism"]}
          comparison={{ party, earnedIds: ["pro-choice", "pro-euro"] }}
        />,
      );

    it("renders a shared trait solid, with the other party avatar", () => {
      renderComparison();

      expect(getBody("Pro-choice")).not.toHaveClass(HATCH_CLASS_NAME);
      expect(queryAvatar("Pro-choice")?.querySelector("img")).toHaveAttribute(
        "src",
        friend.imageUrl,
      );
    });

    it("renders a trait only the other party earned hatched, with their avatar", () => {
      renderComparison();

      expect(getBody("Pro-Euro")).toHaveClass(HATCH_CLASS_NAME);
      expect(queryAvatar("Pro-Euro")).toBeInTheDocument();
    });

    it("renders a trait only the taker earned solid, with no avatar", () => {
      renderComparison();

      expect(getBody("Anarchizm")).not.toHaveClass(HATCH_CLASS_NAME);
      expect(queryAvatar("Anarchizm")).not.toBeInTheDocument();
    });

    it("says in words whose each trait is", () => {
      renderComparison();

      expect(
        screen.getByText("Pro-choice - wspólna z: Ania"),
      ).toBeInTheDocument();
      expect(screen.getByText("Pro-Euro - tylko Ania")).toBeInTheDocument();
      expect(getPill("Anarchizm")).toHaveTextContent(/^Anarchizm$/);
    });

    it("renders a placeholder when the other party has no avatar", () => {
      renderComparison({ ...friend, imageUrl: undefined });

      const avatar = queryAvatar("Pro-choice");

      expect(avatar).toBeInTheDocument();
      expect(avatar?.querySelector("img")).toBeNull();
    });

    it("keeps the order of the definitions and drops what neither earned", () => {
      renderComparison();

      expect(
        screen
          .getAllByTestId("trait-pill")
          .map((pill) => pill.getAttribute("data-holder")),
      ).toEqual(["both", "other", "taker"]);
      expect(screen.queryByText("Monarchizm")).not.toBeInTheDocument();
    });

    it("renders the taker pills without an avatar when the other party earned nothing", () => {
      renderWithI18n(
        <Traits
          traits={traits}
          earnedIds={["anarchism"]}
          comparison={{ party: friend, earnedIds: [] }}
        />,
      );

      expect(screen.getAllByTestId("trait-pill")).toHaveLength(1);
      expect(screen.queryByTestId("trait-pill-avatar")).not.toBeInTheDocument();
    });
  });

  describe("given no traits", () => {
    it("renders the empty line", () => {
      renderWithI18n(<Traits title="Cechy" traits={traits} earnedIds={[]} />);

      expect(screen.getByText(EMPTY_LINE)).toBeVisible();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("renders the empty line when neither party earned any", () => {
      renderWithI18n(
        <Traits
          traits={traits}
          earnedIds={[]}
          comparison={{ party: friend, earnedIds: [] }}
        />,
      );

      expect(screen.getByText(EMPTY_LINE)).toBeVisible();
    });

    it("renders the empty line when the quiz defines no traits", () => {
      renderWithI18n(<Traits traits={[]} earnedIds={["anarchism"]} />);

      expect(screen.getByText(EMPTY_LINE)).toBeVisible();
    });

    it("renders the other party pills hatched when only they earned traits", () => {
      renderWithI18n(
        <Traits
          traits={traits}
          earnedIds={[]}
          comparison={{ party: friend, earnedIds: ["pro-euro", "monarchism"] }}
        />,
      );

      expect(screen.queryByText(EMPTY_LINE)).not.toBeInTheDocument();
      expect(screen.getAllByTestId("trait-pill")).toHaveLength(2);
      for (const body of screen.getAllByTestId("trait-pill-body")) {
        expect(body).toHaveClass(HATCH_CLASS_NAME);
      }
      expect(screen.getAllByTestId("trait-pill-avatar")).toHaveLength(2);
    });
  });

  describe("given a trait without a colour", () => {
    it("uses the neutral colour", () => {
      renderWithI18n(
        <Traits
          traits={[{ ...anarchism, color: undefined }]}
          earnedIds={["anarchism"]}
        />,
      );

      expect(getBody("Anarchizm")).toHaveClass("bg-gi-dark-gray");
      expect(getBody("Anarchizm").style.getPropertyValue("--trait-color")).toBe(
        "",
      );
    });
  });

  describe("given a trait with a light colour", () => {
    it("renders the label in a dark tone", () => {
      renderWithI18n(
        <Traits
          traits={[{ ...anarchism, color: "#ffe066" }]}
          earnedIds={["anarchism"]}
        />,
      );

      expect(getBody("Anarchizm")).toHaveClass("text-gi-primary");
    });
  });

  describe("given handlers", () => {
    it("passes onStatsClick and onInfoClick to the wrapper", () => {
      const onStatsClick = vi.fn();
      const onInfoClick = vi.fn();

      renderWithI18n(
        <Traits
          title="Cechy"
          traits={traits}
          earnedIds={["anarchism"]}
          onStatsClick={onStatsClick}
          onInfoClick={onInfoClick}
        />,
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Statystyki: Cechy" }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Informacje: Cechy" }),
      );

      expect(onStatsClick).toHaveBeenCalledTimes(1);
      expect(onInfoClick).toHaveBeenCalledTimes(1);
    });

    it("renders no buttons without handlers", () => {
      renderWithI18n(
        <Traits title="Cechy" traits={traits} earnedIds={["anarchism"]} />,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
