import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { QuestionFilter } from "./QuestionFilter";

const renderFilter = (isOn = false) => {
  const onChange = vi.fn();

  renderWithI18n(<QuestionFilter isOn={isOn} onChange={onChange} />);

  return { onChange };
};

const getSwitch = () =>
  screen.getByRole("switch", { name: "Tylko niezgodność" });

describe("<QuestionFilter />", () => {
  describe("given the filter off", () => {
    it("is a switch named by the text beside it, and says it is off", () => {
      renderFilter();

      expect(getSwitch()).toBeEnabled();
      expect(getSwitch()).toHaveAttribute("aria-checked", "false");
      expect(screen.getByText("Tylko niezgodność")).toBeVisible();
    });
  });

  describe("given the filter on", () => {
    it("says it is on", () => {
      renderFilter(true);

      expect(getSwitch()).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("when the switch is pressed while off", () => {
    it("asks for the filter to be turned on, and keeps nothing itself", () => {
      const { onChange } = renderFilter();

      fireEvent.click(getSwitch());

      expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(getSwitch()).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("when the switch is pressed while on", () => {
    it("asks for the filter to be turned off", () => {
      const { onChange } = renderFilter(true);

      fireEvent.click(getSwitch());

      expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
    });
  });

  describe("when the text beside the switch is pressed", () => {
    it("switches it too", () => {
      const { onChange } = renderFilter();

      fireEvent.click(screen.getByText("Tylko niezgodność"));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
    });
  });
});
