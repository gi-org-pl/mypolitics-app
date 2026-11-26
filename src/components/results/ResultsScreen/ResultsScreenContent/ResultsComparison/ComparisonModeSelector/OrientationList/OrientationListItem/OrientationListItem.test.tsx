import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Orientation } from "@/types/orientation";

import { OrientationListItem } from "./OrientationListItem";

const ORIENTATION: Orientation = {
  id: "progressivism",
  type: "ideology",
  name: "Progresywizm",
  color: "#9b59b6",
  imageUrl: "https://example.org/progressivism.svg",
};

const renderItem = (orientation: Orientation = ORIENTATION) => {
  const onPick = vi.fn();

  render(<OrientationListItem orientation={orientation} onPick={onPick} />);

  return { onPick };
};

const getMark = () => screen.getByTestId("orientation-avatar");

describe("<OrientationListItem />", () => {
  describe("given an orientation", () => {
    it("is a control named by the orientation", () => {
      renderItem();

      expect(
        screen.getByRole("button", { name: "Progresywizm" }),
      ).toBeEnabled();
    });

    it("draws its mark before the name: the small disc in its colour, with its image", () => {
      renderItem();

      expect(screen.getByRole("button").firstElementChild).toBe(getMark());
      expect(getMark()).toHaveClass("size-6");
      expect(getMark()).toHaveStyle({ "--avatar-color": "#9b59b6" });
      expect(getMark().querySelector("img")).toHaveAttribute(
        "src",
        ORIENTATION.imageUrl,
      );
    });

    it("writes the name in full, on as many lines as it takes", () => {
      renderItem({
        ...ORIENTATION,
        name: "Orientacja o wyjątkowo długiej nazwie",
      });

      const name = screen.getByText("Orientacja o wyjątkowo długiej nazwie");

      expect(name).toHaveClass("wrap-break-word");
      expect(name).not.toHaveClass("truncate");
    });

    it("writes a name with line breaks on one run of text", () => {
      renderItem({ ...ORIENTATION, name: "Wolny\n  rynek" });

      expect(
        screen.getByRole("button", { name: "Wolny rynek" }),
      ).toBeInTheDocument();
    });
  });

  describe("when it is pressed", () => {
    it("picks the orientation", () => {
      const { onPick } = renderItem();

      fireEvent.click(screen.getByRole("button", { name: "Progresywizm" }));

      expect(onPick).toHaveBeenCalledExactlyOnceWith("progressivism");
    });
  });

  describe("given an orientation with no colour and no image", () => {
    it("draws the mark alone, in the grey of a bar", () => {
      renderItem({ ...ORIENTATION, color: undefined, imageUrl: undefined });

      expect(getMark()).toHaveClass("bg-gi-dark-gray");
      expect(getMark().querySelector("img")).not.toBeInTheDocument();
    });
  });
});
