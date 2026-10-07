import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Orientation } from "@/types/orientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { AxisRow } from "./AxisRow";
import type { AxisRowProps } from "./AxisRow.types";

const progressivism: Orientation = {
  id: "progressivism",
  type: "ideology",
  name: "Progresywizm",
  imageUrl: "https://example.com/progressivism.svg",
  color: "#9b59b6",
};

const traditionalism: Orientation = {
  id: "traditionalism",
  type: "ideology",
  name: "Tradycjonalizm",
  imageUrl: "https://example.com/traditionalism.svg",
  color: "#1abc9c",
};

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Ania",
  imageUrl: "https://example.com/ania.png",
};

const LONG_NAME = "Światopogląd z bardzo długą nazwą autorską grupy osi";

const renderRow = (props: Partial<AxisRowProps> = {}) =>
  renderWithI18n(
    <AxisRow
      start={{ orientation: progressivism, value: 69 }}
      end={{ orientation: traditionalism, value: 31 }}
      {...props}
    />,
  );

describe("<AxisRow />", () => {
  describe("given a name and a lead name", () => {
    it("renders the name quiet and the lead name strong", () => {
      renderRow({ name: "Światopogląd", leadName: "Progresywizm" });

      const heading = screen.getByRole("heading", { level: 3 });

      expect(heading.textContent).toBe("Światopogląd — Progresywizm");
      expect(screen.getByText("Światopogląd")).toHaveClass(
        "text-gi-primary/50",
      );
      expect(
        screen.getByText("Progresywizm", { selector: "h3 > span" }),
      ).toHaveClass("text-gi-primary");
    });

    it("keeps the dash with the lead name, so both wrap to the second line together", () => {
      renderRow({ name: "Światopogląd", leadName: "Progresywizm" });

      const heading = screen.getByRole("heading", { level: 3 });
      const [namePart, leadPart] = Array.from(heading.children);

      expect(heading).toHaveClass("flex", "flex-wrap");
      expect(heading.children).toHaveLength(2);
      expect(namePart.textContent).toBe("Światopogląd ");
      expect(leadPart.textContent).toBe("— Progresywizm");
      expect(screen.getByText("—")).toHaveClass("text-gi-primary/50");
      expect(leadPart).toContainElement(screen.getByText("—"));
    });

    it("truncates a part only when that part alone is wider than the row", () => {
      renderRow({ name: "Światopogląd", leadName: "Progresywizm" });

      const heading = screen.getByRole("heading", { level: 3 });

      for (const part of Array.from(heading.children)) {
        expect(part).toHaveClass("max-w-full", "min-w-0", "truncate");
        expect(part).not.toHaveClass("shrink", "flex-1");
      }
    });

    it("collapses line breaks into one line", () => {
      renderRow({ name: " Świato\npogląd ", leadName: "Progre\n\nsywizm" });

      expect(screen.getByRole("heading").textContent).toBe(
        "Świato pogląd — Progre sywizm",
      );
    });
  });

  describe("given no lead name", () => {
    it("renders the name alone", () => {
      renderRow({ name: "Światopogląd" });

      const heading = screen.getByRole("heading", { level: 3 });

      expect(heading.textContent).toBe("Światopogląd");
      expect(screen.getByText("Światopogląd")).toHaveClass(
        "text-gi-primary/50",
      );
    });
  });

  describe("given no name", () => {
    it("renders the lead name alone, strong", () => {
      renderRow({ leadName: "Progresywizm" });

      const heading = screen.getByRole("heading", { level: 3 });

      expect(heading.textContent).toBe("Progresywizm");
      expect(heading.firstElementChild).toHaveClass("text-gi-primary");
    });
  });

  describe("given neither a name nor a lead name", () => {
    it.each([
      [undefined, undefined],
      ["", "  "],
      [42 as unknown as string, undefined],
    ])("renders no heading for %j and %j", (name, leadName) => {
      renderRow({ name, leadName });

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(screen.getByRole("img")).toBeInTheDocument();
    });
  });

  describe("given a long name", () => {
    it("keeps the full text for assistive technology", () => {
      renderRow({ name: LONG_NAME, leadName: "Progresywizm" });

      expect(screen.getByText(LONG_NAME)).toHaveClass("max-w-full", "truncate");
      expect(screen.getByRole("heading")).toHaveTextContent(
        `${LONG_NAME} — Progresywizm`,
      );
    });
  });

  describe("bar", () => {
    it("renders a double-sided bar with the marker", () => {
      renderRow({ marker: 40 });

      expect(screen.getByTestId("universal-axis-cap-start")).toBeVisible();
      expect(screen.getByTestId("universal-axis-cap-end")).toBeVisible();
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "69%",
      });
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveStyle({
        width: "31%",
      });
      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("40%");
    });

    it("renders the marker in the middle by default", () => {
      renderRow();

      expect(
        screen
          .getByTestId("universal-axis-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("50%");
    });

    it("renders no marker when it is off", () => {
      renderRow({ marker: false });

      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
    });

    it("keeps a side without a value as an unfilled side", () => {
      renderRow({ start: { orientation: progressivism } });

      expect(screen.getByTestId("universal-axis-cap-start")).toBeVisible();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
    });

    it("renders labels only when showLabels is on", () => {
      const { unmount } = renderRow();

      expect(
        screen.queryByTestId("universal-axis-labels"),
      ).not.toBeInTheDocument();

      unmount();
      renderRow({ showLabels: true });

      const labels = screen.getByTestId("universal-axis-labels");

      expect(labels).toHaveTextContent("Progresywizm");
      expect(labels).toHaveTextContent("Tradycjonalizm");
    });

    it("passes a comparison to the bar", () => {
      renderRow({ comparison: { orientation: friend, value: 90 } });

      expect(
        screen.getByTestId("universal-axis-comparison-image"),
      ).toBeInTheDocument();
      expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
        "Ania: 90%",
      );
    });
  });

  describe("layout", () => {
    it("fills the width of its parent", () => {
      renderRow();

      expect(screen.getByTestId("axis-row")).toHaveClass("w-full", "min-w-0");
    });
  });
});
