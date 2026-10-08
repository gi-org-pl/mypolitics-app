import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { SurveyCheckpointOptionsRow } from "./SurveyCheckpointOptionsRow";

const IMAGE_URL = "https://example.com/free-market.svg";

const freeMarket = createOrientation("free-market", "Wolny rynek", {
  imageUrl: IMAGE_URL,
  color: "#2ecc71",
});

const getRow = () => screen.getByRole("button");

const getImage = () => screen.getByTestId("survey-checkpoint-options-image");

describe("<SurveyCheckpointOptionsRow />", () => {
  describe("given an orientation with an image, a colour and a name", () => {
    it("is a button named by the name alone", () => {
      render(
        <SurveyCheckpointOptionsRow
          orientation={freeMarket}
          onSelect={vi.fn()}
        />,
      );

      expect(getRow()).toHaveAccessibleName("Wolny rynek");
      expect(getRow()).toHaveAttribute("type", "button");
      expect(getRow()).toHaveTextContent(/^Wolny rynek$/);
      expect(getImage()).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("shows the image on the colour", () => {
      render(
        <SurveyCheckpointOptionsRow
          orientation={freeMarket}
          onSelect={vi.fn()}
        />,
      );

      expect(getImage()).toHaveStyle({
        backgroundColor: "#2ecc71",
        backgroundImage: `url("${IMAGE_URL}")`,
      });
      expect(getImage()).toHaveClass("size-6", "rounded-full", "bg-cover");
      expect(
        getImage().compareDocumentPosition(screen.getByText("Wolny rynek")) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("meets the minimum touch target and shows a focus state", () => {
      render(
        <SurveyCheckpointOptionsRow
          orientation={freeMarket}
          onSelect={vi.fn()}
        />,
      );

      expect(getRow()).toHaveClass(
        "min-h-12",
        "w-full",
        "focus-visible:outline-2",
      );
    });

    it("has no look for a row that was chosen, right or wrong", () => {
      render(
        <SurveyCheckpointOptionsRow
          orientation={freeMarket}
          onSelect={vi.fn()}
        />,
      );

      expect(getRow()).not.toHaveAttribute("aria-pressed");
      expect(getRow()).not.toHaveAttribute("aria-checked");
      expect(getRow()).not.toHaveAttribute("aria-selected");
      expect(getRow()).not.toBeDisabled();
    });
  });

  describe("given no image", () => {
    it("shows the colour alone", () => {
      render(
        <SurveyCheckpointOptionsRow
          orientation={{ ...freeMarket, imageUrl: undefined }}
          onSelect={vi.fn()}
        />,
      );

      expect(getImage()).toHaveStyle({ backgroundColor: "#2ecc71" });
      expect(getImage().style.backgroundImage).toBe("");
    });
  });

  describe("given an image that fails to load", () => {
    it("shows what a row without an image shows", () => {
      const { container } = render(
        <SurveyCheckpointOptionsRow
          orientation={{ ...freeMarket, imageUrl: "https://example.com/gone" }}
          onSelect={vi.fn()}
        />,
      );

      // The image is painted over the colour of the same disc and is no
      // element of its own: nothing is left to show as broken, and the
      // colour under it is what stays.
      expect(container.querySelector("img")).toBeNull();
      expect(getImage()).toBeEmptyDOMElement();
      expect(getImage()).toHaveStyle({ backgroundColor: "#2ecc71" });
    });
  });

  describe("given no colour, or a value that is not a colour", () => {
    it("shows the neutral fallback", () => {
      const { unmount } = render(
        <SurveyCheckpointOptionsRow
          orientation={{ ...freeMarket, color: undefined }}
          onSelect={vi.fn()}
        />,
      );

      expect(getImage()).toHaveClass("bg-gi-dark-gray");
      expect(getImage().style.backgroundColor).toBe("");
      expect(getImage()).toHaveStyle({
        backgroundImage: `url("${IMAGE_URL}")`,
      });

      unmount();
      render(
        <SurveyCheckpointOptionsRow
          orientation={{ ...freeMarket, color: "not-a-colour" }}
          onSelect={vi.fn()}
        />,
      );

      expect(getImage()).toHaveClass("bg-gi-dark-gray");
      expect(getImage().style.backgroundColor).toBe("");
    });
  });

  describe("given neither image nor colour", () => {
    it("shows the neutral fallback alone", () => {
      render(
        <SurveyCheckpointOptionsRow
          orientation={createOrientation("plain", "Wolny rynek")}
          onSelect={vi.fn()}
        />,
      );

      expect(getImage()).toHaveClass("bg-gi-dark-gray");
      expect(getImage()).not.toHaveAttribute("style");
      expect(getRow()).toHaveAccessibleName("Wolny rynek");
    });
  });

  describe("given a name with line breaks or doubled spaces", () => {
    it("shows it on one line of text", () => {
      render(
        <SurveyCheckpointOptionsRow
          orientation={{
            ...freeMarket,
            name: "  Wolny \n\n rynek   i  handel ",
          }}
          onSelect={vi.fn()}
        />,
      );

      expect(getRow().textContent).toBe("Wolny rynek i handel");
    });
  });

  describe("given a long name", () => {
    it("does not truncate it", () => {
      const name = "Liberalizm gospodarczy i światopoglądowy ".repeat(4).trim();

      render(
        <SurveyCheckpointOptionsRow
          orientation={{ ...freeMarket, name }}
          onSelect={vi.fn()}
        />,
      );

      expect(screen.getByText(name)).toHaveClass("wrap-break-word", "min-w-0");
      expect(
        `${getRow().className} ${screen.getByText(name).className}`,
      ).not.toMatch(/truncate|line-clamp|whitespace-nowrap|overflow-hidden/);
      expect(getImage()).toHaveClass("shrink-0");
    });
  });

  describe("when activated with a click, Enter or Space", () => {
    it("calls onSelect", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <SurveyCheckpointOptionsRow
          orientation={freeMarket}
          onSelect={onSelect}
        />,
      );

      await user.click(getRow());

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenLastCalledWith(freeMarket);

      // The click left the focus on the row.
      expect(getRow()).toHaveFocus();
      await user.keyboard("{Enter}");

      expect(onSelect).toHaveBeenCalledTimes(2);

      await user.keyboard(" ");

      expect(onSelect).toHaveBeenCalledTimes(3);
      expect(onSelect).toHaveBeenLastCalledWith(freeMarket);
    });
  });
});
