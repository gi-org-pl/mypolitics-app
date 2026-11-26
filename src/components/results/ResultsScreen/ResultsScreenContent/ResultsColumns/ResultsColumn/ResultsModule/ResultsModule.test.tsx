import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { ResultsModule } from "./ResultsModule";

// The traits card stands in for a module that fails while it draws.
vi.mock("@/components/results/Traits/Traits", () => ({
  Traits: () => {
    throw new Error("The traits cannot be drawn");
  },
}));

describe("<ResultsModule />", () => {
  beforeEach(() => {
    // React reports the caught error to the console; the test keeps it quiet.
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("given a module that draws", () => {
    it("draws the module", () => {
      renderWithI18n(
        <ResultsModule module={findModule("multi_axis")} order={2} />,
      );

      expect(
        screen.getByRole("region", { name: "Ideologie" }),
      ).toBeInTheDocument();
    });

    it("stands at its place in the order of the whole list", () => {
      const { container } = renderWithI18n(
        <ResultsModule module={findModule("multi_axis")} order={2} />,
      );

      expect(container.firstElementChild).toHaveStyle({ order: "2" });
      expect(container.firstElementChild).toContainElement(
        screen.getByRole("region", { name: "Ideologie" }),
      );
    });
  });

  describe("given a module that throws while it draws", () => {
    it("draws nothing of it, and leaves its place empty so that it takes no room", () => {
      const { container } = renderWithI18n(
        <ResultsModule module={findModule("traits")} order={0} />,
      );

      expect(screen.queryByRole("region")).not.toBeInTheDocument();
      expect(container.firstElementChild).toBeEmptyDOMElement();
      expect(container.firstElementChild).toHaveClass("empty:hidden");
    });

    it("keeps what stands beside it", () => {
      renderWithI18n(
        <div>
          <ResultsModule module={findModule("traits")} order={0} />
          <ResultsModule module={findModule("archetype")} order={1} />
        </div>,
      );

      expect(
        screen.getByRole("region", { name: "Tożsamość" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("region")).toHaveLength(1);
    });
  });
});
