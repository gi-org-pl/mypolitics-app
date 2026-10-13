import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchField } from "./SearchField";

const renderField = (value = "") => {
  const onChange = vi.fn();

  render(<SearchField label="Szukaj" value={value} onChange={onChange} />);

  return { onChange };
};

const getField = () => screen.getByRole("searchbox", { name: "Szukaj" });

describe("<SearchField />", () => {
  describe("given a label", () => {
    it("is a search box named by it", () => {
      renderField();

      expect(getField()).toBeEnabled();
    });

    it("shows the label in the field while it is empty", () => {
      renderField();

      expect(getField()).toHaveValue("");
      expect(getField()).toHaveAttribute("placeholder", "Szukaj");
    });

    it("draws the magnifier as decoration", () => {
      const { container } = render(
        <SearchField label="Szukaj" value="" onChange={vi.fn()} />,
      );

      expect(container.querySelector("img")).toHaveAttribute("alt", "");
    });

    it("offers no text the browser remembers", () => {
      renderField();

      expect(getField()).toHaveAttribute("autocomplete", "off");
    });
  });

  describe("given a text", () => {
    it("shows it", () => {
      renderField("demokracja");

      expect(getField()).toHaveValue("demokracja");
    });
  });

  describe("when the text is changed", () => {
    it("says what it was changed to, and keeps nothing itself", () => {
      const { onChange } = renderField();

      fireEvent.change(getField(), { target: { value: "unia" } });

      expect(onChange).toHaveBeenCalledExactlyOnceWith("unia");
      expect(getField()).toHaveValue("");
    });
  });
});
