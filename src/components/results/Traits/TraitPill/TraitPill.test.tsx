import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HATCH_LIGHT_CLASS_NAME } from "@/constants/hatch";
import type { AxisOrientation } from "@/types/axis";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { TraitItem } from "../Traits.types";
import { TraitPill } from "./TraitPill";

const IMAGE_URL = "https://example.com/anarchism.svg";
const LONG_NAME =
  "Radykalizm społeczno-gospodarczy z bardzo długą nazwą autorską";

const anarchism: TraitItem = {
  id: "anarchism",
  name: "Anarchizm",
  imageUrl: IMAGE_URL,
  color: "#192430",
  holder: "taker",
};

const friend: AxisOrientation = {
  id: "friend",
  name: "Ania",
  imageUrl: "https://example.com/ania.png",
};

const getBody = () => screen.getByTestId("trait-pill-body");

describe("<TraitPill />", () => {
  describe("given a trait the taker holds", () => {
    it("renders a list item named by the trait", () => {
      renderWithI18n(<TraitPill item={anarchism} />);

      expect(screen.getByRole("listitem")).toHaveTextContent(/^Anarchizm$/);
    });

    it("fills the pill with the trait colour through a custom property", () => {
      renderWithI18n(<TraitPill item={anarchism} />);

      expect(getBody().style.getPropertyValue("--trait-color")).toBe("#192430");
      expect(getBody()).toHaveClass("bg-(--trait-color)", "text-white");
      expect(getBody()).not.toHaveClass(HATCH_LIGHT_CLASS_NAME);
    });

    it("renders the icon as decoration, before the name", () => {
      renderWithI18n(<TraitPill item={anarchism} />);

      const image = screen.getByTestId("trait-pill-image");

      expect(image).toHaveAttribute("src", IMAGE_URL);
      expect(image).toHaveAttribute("alt", "");
      expect(image).not.toHaveClass("brightness-0");
      expect(image.nextElementSibling).toHaveTextContent("Anarchizm");
    });

    it("renders no avatar, even when a party is passed", () => {
      renderWithI18n(<TraitPill item={anarchism} party={friend} />);

      expect(screen.queryByTestId("trait-pill-avatar")).not.toBeInTheDocument();
      expect(screen.getByRole("listitem")).toHaveTextContent(/^Anarchizm$/);
    });
  });

  describe("given a trait without an icon", () => {
    it("renders the name alone", () => {
      renderWithI18n(
        <TraitPill item={{ ...anarchism, imageUrl: undefined }} />,
      );

      expect(screen.getByText("Anarchizm")).toBeInTheDocument();
      expect(screen.queryByTestId("trait-pill-image")).not.toBeInTheDocument();
    });
  });

  describe("given a trait both hold", () => {
    it("renders a solid pill with the other party avatar", () => {
      renderWithI18n(
        <TraitPill item={{ ...anarchism, holder: "both" }} party={friend} />,
      );

      expect(getBody()).not.toHaveClass(HATCH_LIGHT_CLASS_NAME);
      expect(
        screen.getByTestId("trait-pill-avatar").querySelector("img"),
      ).toHaveAttribute("src", friend.imageUrl);
    });

    it("says in words that it is shared", () => {
      renderWithI18n(
        <TraitPill item={{ ...anarchism, holder: "both" }} party={friend} />,
      );

      expect(
        screen.getByText("Anarchizm - wspólna z: Ania"),
      ).toBeInTheDocument();
      expect(screen.getByText("Anarchizm")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });

  describe("given a trait only the other party holds", () => {
    it("renders a hatched pill with their avatar", () => {
      renderWithI18n(
        <TraitPill item={{ ...anarchism, holder: "other" }} party={friend} />,
      );

      expect(getBody()).toHaveClass(
        HATCH_LIGHT_CLASS_NAME,
        "bg-(--trait-color)",
      );
      expect(screen.getByTestId("trait-pill-avatar")).toBeInTheDocument();
    });

    it("says in words that it is only theirs", () => {
      renderWithI18n(
        <TraitPill item={{ ...anarchism, holder: "other" }} party={friend} />,
      );

      expect(screen.getByText("Anarchizm - tylko Ania")).toBeInTheDocument();
    });
  });

  describe("given the other party has no avatar", () => {
    it("renders a placeholder in the same place", () => {
      renderWithI18n(
        <TraitPill
          item={{ ...anarchism, holder: "both" }}
          party={{ ...friend, imageUrl: undefined }}
        />,
      );

      const avatar = screen.getByTestId("trait-pill-avatar");

      expect(avatar.querySelector("img")).toBeNull();
      expect(avatar.querySelector("svg")).not.toBeNull();
    });
  });

  describe("given no party", () => {
    it("renders a trait marked as theirs like the taker own", () => {
      renderWithI18n(<TraitPill item={{ ...anarchism, holder: "other" }} />);

      expect(getBody()).not.toHaveClass(HATCH_LIGHT_CLASS_NAME);
      expect(screen.queryByTestId("trait-pill-avatar")).not.toBeInTheDocument();
      expect(screen.getByRole("listitem")).toHaveTextContent(/^Anarchizm$/);
    });
  });

  describe("given a trait without a colour", () => {
    it.each([
      undefined,
      "red; background: url(x)",
    ])("uses the neutral colour for %j", (color) => {
      renderWithI18n(<TraitPill item={{ ...anarchism, color }} />);

      expect(getBody().style.getPropertyValue("--trait-color")).toBe("");
      expect(getBody()).toHaveClass("bg-gi-dark-gray", "text-white");
      expect(getBody()).not.toHaveClass("bg-(--trait-color)");
    });
  });

  describe("given a trait with a light colour", () => {
    it("renders the label and the icon in a dark tone", () => {
      renderWithI18n(<TraitPill item={{ ...anarchism, color: "#ffe066" }} />);

      expect(getBody()).toHaveClass("text-gi-primary");
      expect(getBody()).not.toHaveClass("text-white");
      expect(screen.getByTestId("trait-pill-image")).toHaveClass(
        "brightness-0",
      );
    });
  });

  describe("given a long name", () => {
    it("truncates it to one line and keeps the full text", () => {
      renderWithI18n(<TraitPill item={{ ...anarchism, name: LONG_NAME }} />);

      expect(screen.getByText(LONG_NAME)).toHaveClass("truncate", "min-w-0");
      expect(screen.getByRole("listitem")).toHaveClass("max-w-full", "min-w-0");
    });
  });

  describe("interaction", () => {
    it("is never interactive", () => {
      renderWithI18n(
        <TraitPill item={{ ...anarchism, holder: "both" }} party={friend} />,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByRole("listitem")).not.toHaveAttribute("tabindex");
    });
  });
});
