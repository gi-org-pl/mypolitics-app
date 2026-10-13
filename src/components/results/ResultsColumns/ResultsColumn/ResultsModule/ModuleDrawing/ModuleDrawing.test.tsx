import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { ResolvedModule } from "@/types/results";
import {
  findModule,
  resolvedModules,
} from "@/utils/result-modules/resolvedModules.fixtures";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { MODULES_COMPARISON } from "../../../ResultsColumns.fixtures";
import type { ModulesComparison } from "../../../ResultsColumns.types";
import { ModuleDrawing } from "./ModuleDrawing";

const DESCRIPTION = "Jak ta tożsamość prawdopodobnie zagłosowałaby w wyborach.";

const renderModule = (module: ResolvedModule, comparison?: ModulesComparison) =>
  renderWithI18n(<ModuleDrawing module={module} comparison={comparison} />);

describe("<ModuleDrawing />", () => {
  describe("given a resolved module of each type", () => {
    it.each([
      ["single_axis", "Ekologia"],
      ["double_axis", "Interwencjonizm"],
      ["multi_axis", "Ideologie"],
      ["horizontal_bar", "Partie"],
      ["nolan_chart", "gospodarczo"],
      ["archetype", "Tożsamość"],
      ["traits", "Cechy"],
    ] as const)("draws the card of its component: %s", (type, text) => {
      renderModule(findModule(type));

      expect(
        within(screen.getByRole("region")).getAllByText(text)[0],
      ).toBeInTheDocument();
    });

    it("names the card of a module with a title by that title", () => {
      renderModule(findModule("multi_axis"));

      expect(
        screen.getByRole("region", { name: "Ideologie" }),
      ).toBeInTheDocument();
    });

    it("hands the module what it was resolved to", () => {
      renderModule(findModule("horizontal_bar"));

      const card = within(screen.getByRole("region", { name: "Partie" }));

      expect(card.getByText("Zieloni")).toBeInTheDocument();
      expect(card.getByText("Lewica")).toBeInTheDocument();
      expect(card.getByRole("img", { name: "Zweryfikowany" })).toBeVisible();
    });
  });

  describe("given a comparison", () => {
    it("lays the other side over a single axis, with their value of the same orientation", () => {
      renderModule(findModule("single_axis"), MODULES_COMPARISON);

      expect(
        screen.getByRole("img", {
          name: "Ekologia: 100%, porównanie z Znajomy: 100%",
        }),
      ).toBeInTheDocument();
    });

    it("lays the other side over a double axis, at their start-side value", () => {
      renderModule(findModule("double_axis"), MODULES_COMPARISON);

      expect(
        screen.getByRole("img", { name: /porównanie z Znajomy: 0%$/ }),
      ).toBeInTheDocument();
    });

    it("lays the other side over every axis of a multi axis", () => {
      renderModule(findModule("multi_axis"), MODULES_COMPARISON);

      expect(
        screen.getByRole("img", { name: /porównanie z Znajomy: 50%$/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: /porównanie z Znajomy: 0%$/ }),
      ).toBeInTheDocument();
    });

    it("lays the other side over every row of a ranking, and keeps the order of the taker", () => {
      renderModule(findModule("horizontal_bar"), MODULES_COMPARISON);

      const card = within(screen.getByRole("region", { name: "Partie" }));

      expect(
        card.getAllByRole("img", { name: /porównanie z Znajomy/ }),
      ).toHaveLength(2);
      expect(
        card.getByRole("img", { name: "porównanie z Znajomy: 75%" }),
      ).toBeInTheDocument();
      expect(
        card.getByRole("img", { name: "porównanie z Znajomy: 25%" }),
      ).toBeInTheDocument();
    });

    it("marks the position of the other side on the Nolan chart", () => {
      const { container: alone } = renderModule(findModule("nolan_chart"));
      const marksAlone = alone.querySelectorAll("[data-testid*=comparison]");

      const { container } = renderModule(
        findModule("nolan_chart"),
        MODULES_COMPARISON,
      );

      expect(marksAlone).toHaveLength(0);
      expect(
        container.querySelectorAll("[data-testid*=comparison]").length,
      ).toBeGreaterThan(0);
    });

    it("draws a module the other result does not draw for one side alone", () => {
      renderModule(findModule("single_axis"), {
        ...MODULES_COMPARISON,
        modules: [],
      });

      expect(screen.getByRole("img", { name: "Ekologia: 100%" })).toBeVisible();
    });
  });

  describe("given any module", () => {
    it("offers no statistics action", () => {
      for (const module of resolvedModules) {
        const { unmount } = renderModule({
          ...module,
          description: DESCRIPTION,
        });

        expect(
          screen.queryByRole("button", { name: /^Statystyki/ }),
        ).not.toBeInTheDocument();

        unmount();
      }
    });
  });

  describe("given a record with no description, or a blank one", () => {
    it.each([
      ["none", undefined],
      ["only spaces", "   "],
    ])("shows no info action and no dialog: %s", (_, description) => {
      renderModule({ ...findModule("horizontal_bar"), description });

      expect(
        screen.queryByRole("button", { name: /^Informacje/ }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("given a record with a description", () => {
    const module = {
      ...findModule("horizontal_bar"),
      description: DESCRIPTION,
    };

    it("shows the info action, named with the title of the module", () => {
      renderModule(module);

      expect(
        screen.getByRole("button", { name: "Informacje: Partie" }),
      ).toBeEnabled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens a dialog with the title and the description when the info action is used", () => {
      renderModule(module);

      fireEvent.click(
        screen.getByRole("button", { name: "Informacje: Partie" }),
      );

      const dialog = screen.getByRole("dialog", { name: "Partie" });

      expect(within(dialog).getByText(DESCRIPTION)).toBeVisible();
    });

    it("hands the focus back to the info action when the dialog is closed", async () => {
      const user = userEvent.setup();

      renderModule(module);

      const action = screen.getByRole("button", { name: "Informacje: Partie" });

      await user.click(action);

      expect(screen.getByRole("dialog")).toContainElement(
        document.activeElement as HTMLElement,
      );

      await user.click(screen.getByRole("button", { name: "Zamknij" }));

      expect(action).toHaveFocus();
    });

    it("hands the focus back when the dialog is closed with Escape", async () => {
      const user = userEvent.setup();

      renderModule(module);

      const action = screen.getByRole("button", { name: "Informacje: Partie" });

      await user.click(action);
      await user.keyboard("{Escape}");

      expect(action).toHaveFocus();
    });
  });

  describe("given a module with a description and no title", () => {
    it('names the dialog "Informacje"', () => {
      renderModule(findModule("double_axis"));

      fireEvent.click(screen.getByRole("button", { name: /^Informacje/ }));

      expect(
        within(screen.getByRole("dialog", { name: "Informacje" })).getByText(
          "Jak blisko ci do każdej ze stron osi.",
        ),
      ).toBeVisible();
    });
  });
});
