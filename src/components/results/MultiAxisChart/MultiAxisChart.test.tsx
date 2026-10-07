import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Orientation } from "@/types/orientation";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { MultiAxisChart } from "./MultiAxisChart";
import type {
  AxisGroup,
  AxisPair,
  MultiAxisChartProps,
} from "./MultiAxisChart.types";

const createAxis = (
  id: string,
  startName: string,
  endName: string,
  startValue?: number,
  endValue?: number,
): AxisPair => ({
  id,
  start: {
    orientation: createOrientation(`${id}-start`, startName, {
      imageUrl: `https://example.com/${id}-start.svg`,
      color: "#9b59b6",
    }),
    value: startValue,
  },
  end: {
    orientation: createOrientation(`${id}-end`, endName, {
      imageUrl: `https://example.com/${id}-end.svg`,
      color: "#9b59b6",
    }),
    value: endValue,
  },
});

const worldview: AxisGroup = {
  name: "Światopogląd",
  axes: [
    createAxis("worldview", "Progresywizm", "Tradycjonalizm", 69, 31),
    createAxis("force", "Pacyfizm", "Militaryzm", 5, 95),
    createAxis("faith", "Sekularyzm", "Religijność", 60, 40),
  ],
};

const economy: AxisGroup = {
  name: "Gospodarka",
  axes: [
    createAxis("economy", "Interwencjonizm", "Wolny rynek", 31, 69),
    createAxis("taxes", "Redystrybucja", "Niskie podatki", 80, 20),
  ],
};

const foreignPolicy: AxisGroup = {
  name: "Polityka zagraniczna",
  axes: [createAxis("foreign", "Globalizm", "Suwerenizm", 50, 50)],
};

const friend: Orientation = {
  id: "friend",
  type: "person",
  name: "Ania",
  imageUrl: "https://example.com/ania.png",
};

const GROUPS = [worldview, economy, foreignPolicy];

const renderChart = (props: Partial<MultiAxisChartProps> = {}) =>
  renderWithI18n(
    <MultiAxisChart title="Ideologie" groups={GROUPS} {...props} />,
  );

const getGroups = () => screen.getAllByTestId("multi-axis-chart-group");

const getOpenControl = (name: string) =>
  screen.getByRole("button", { name: `Pokaż grupę: ${name}` });

const getCloseControl = (name: string) =>
  screen.getByRole("button", {
    name: `Wróć do grup, zamknij grupę: ${name}`,
  });

const getBars = (container: HTMLElement = document.body) =>
  within(container)
    .getAllByRole("img")
    .filter((element) => element.tagName === "DIV");

const getPreviewSources = (group: HTMLElement, side: "start" | "end") =>
  Array.from(
    within(group)
      .getByTestId(`multi-axis-chart-preview-${side}`)
      .querySelectorAll("img"),
  ).map((image) => image.getAttribute("src"));

describe("<MultiAxisChart />", () => {
  describe("given groups", () => {
    it("renders one row per group, in the given order", () => {
      renderChart();

      expect(
        screen
          .getAllByRole("heading", { level: 3 })
          .map((heading) => heading.textContent),
      ).toEqual([
        "Światopogląd — Progresywizm",
        "Gospodarka — Wolny rynek",
        "Polityka zagraniczna",
      ]);
      expect(getGroups()).toHaveLength(3);
      expect(screen.getAllByTestId("axis-row")).toHaveLength(3);
    });

    it("draws the first axis of each group as its bar, with labels", () => {
      renderChart();

      expect(getBars().map((bar) => bar.getAttribute("aria-label"))).toEqual([
        "Progresywizm: 69%, Tradycjonalizm: 31%",
        "Interwencjonizm: 31%, Wolny rynek: 69%",
        "Globalizm: 50%, Suwerenizm: 50%",
      ]);
      expect(screen.getAllByTestId("universal-axis-labels")).toHaveLength(3);
      expect(screen.getAllByTestId("universal-axis-marker")).toHaveLength(3);
    });

    it("heads each group with its name and the headline axis lead", () => {
      renderChart();

      const [heading] = screen.getAllByRole("heading", { level: 3 });

      expect(within(heading).getByText("Światopogląd")).toHaveClass(
        "text-gi-primary/50",
      );
      expect(within(heading).getByText("Progresywizm")).toHaveClass(
        "text-gi-primary",
      );
    });

    it("does not rename a group after a stronger axis inside it", () => {
      renderChart();

      const [heading] = screen.getAllByRole("heading", { level: 3 });

      expect(heading).not.toHaveTextContent("Militaryzm");
      expect(heading).toHaveTextContent("Progresywizm");
    });

    it("names the card after its title", () => {
      renderChart();

      expect(screen.getByRole("region", { name: "Ideologie" })).toBeVisible();
      expect(
        screen.getByRole("heading", { level: 2, name: "Ideologie" }),
      ).toBeVisible();
    });
  });

  describe("given a group whose headline axis is a tie", () => {
    it("heads it with the group name alone", () => {
      renderChart({ groups: [foreignPolicy] });

      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "Polityka zagraniczna",
      );
    });

    it("decides the tie on rounded values", () => {
      renderChart({
        groups: [
          {
            name: "Ustrój",
            axes: [
              createAxis("system", "Demokracja", "Autorytaryzm", 50.4, 49.6),
            ],
          },
        ],
      });

      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "Ustrój",
      );
    });
  });

  describe("given a group with more than one axis", () => {
    it("renders the preview icons, start poles on one side and end poles on the other", () => {
      renderChart();

      const [group] = getGroups();

      expect(getPreviewSources(group, "start")).toEqual([
        "https://example.com/worldview-start.svg",
        "https://example.com/force-start.svg",
        "https://example.com/faith-start.svg",
      ]);
      expect(getPreviewSources(group, "end")).toEqual([
        "https://example.com/worldview-end.svg",
        "https://example.com/force-end.svg",
        "https://example.com/faith-end.svg",
      ]);
    });

    it("renders the preview icons as decoration", () => {
      renderChart();

      const [group] = getGroups();

      expect(
        within(group)
          .getByTestId("multi-axis-chart-preview-start")
          .querySelectorAll('img[alt=""]'),
      ).toHaveLength(3);
      expect(getOpenControl("Światopogląd")).toHaveAccessibleName(
        "Pokaż grupę: Światopogląd",
      );
    });

    it("cuts the preview at what fits instead of growing", () => {
      renderChart();

      expect(
        screen.getAllByTestId("multi-axis-chart-preview-start")[0],
      ).toHaveClass("h-4", "flex-wrap", "overflow-hidden");
    });

    it("renders a control that opens the group", () => {
      renderChart();

      fireEvent.click(getOpenControl("Światopogląd"));

      expect(screen.getByTestId("multi-axis-chart-open-group")).toBeVisible();
    });

    it("leaves an orientation without an icon out of the preview", () => {
      const [headline, force, faith] = worldview.axes;

      renderChart({
        groups: [
          {
            ...worldview,
            axes: [
              headline,
              {
                ...force,
                start: {
                  ...force.start,
                  orientation: { ...force.start.orientation, imageUrl: "" },
                },
              },
              faith,
            ],
          },
        ],
      });

      const [group] = getGroups();

      expect(getPreviewSources(group, "start")).toEqual([
        "https://example.com/worldview-start.svg",
        "https://example.com/faith-start.svg",
      ]);
      expect(getPreviewSources(group, "end")).toHaveLength(3);
    });
  });

  describe("given a group with one axis", () => {
    it("renders no preview and no control", () => {
      renderChart({ groups: [foreignPolicy] });

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("multi-axis-chart-preview-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("multi-axis-chart-preview-end"),
      ).not.toBeInTheDocument();
    });
  });

  describe("when a group is opened", () => {
    it("renders that group alone", () => {
      renderChart();

      fireEvent.click(getOpenControl("Światopogląd"));

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(
        screen
          .getAllByRole("heading", { level: 3 })
          .map((heading) => heading.textContent),
      ).toEqual(["Światopogląd — Progresywizm"]);
      expect(screen.queryByText("Wolny rynek")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Ideologie" }),
      ).toBeVisible();
    });

    it("renders the headline bar first, then every other axis as a labelled bar with no heading", () => {
      renderChart();

      fireEvent.click(getOpenControl("Światopogląd"));

      expect(getBars().map((bar) => bar.getAttribute("aria-label"))).toEqual([
        "Progresywizm: 69%, Tradycjonalizm: 31%",
        "Pacyfizm: 5%, Militaryzm: 95%",
        "Sekularyzm: 60%, Religijność: 40%",
      ]);
      expect(screen.getAllByTestId("universal-axis-labels")).toHaveLength(3);
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
    });

    it("renders one marker line through the group", () => {
      renderChart({ marker: 40 });

      fireEvent.click(getOpenControl("Światopogląd"));

      const marker = screen.getByTestId("multi-axis-chart-marker");

      expect(marker.style.getPropertyValue("--axis-position")).toBe("40%");
      expect(marker).toHaveClass(
        "left-[clamp(0px,calc(var(--axis-position)-0.5px),calc(100%-1px))]",
        "w-px",
        "bg-gi-primary/30",
      );
      expect(marker.parentElement).toHaveClass(
        "inset-x-5",
        "-top-15",
        "bottom-4",
        "pointer-events-none",
      );
      expect(marker.parentElement).toHaveAttribute("aria-hidden", "true");
      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
    });

    it("draws the line in the middle by default", () => {
      renderChart();

      fireEvent.click(getOpenControl("Światopogląd"));

      expect(
        screen
          .getByTestId("multi-axis-chart-marker")
          .style.getPropertyValue("--axis-position"),
      ).toBe("50%");
    });

    it("anchors the line to the bars when the group has no heading", () => {
      renderChart({
        groups: [
          {
            axes: [
              createAxis("a", "Globalizm", "Suwerenizm", 50, 50),
              createAxis("b", "Pacyfizm", "Militaryzm", 5, 95),
            ],
          },
        ],
      });

      fireEvent.click(getOpenControl("Globalizm / Suwerenizm"));

      expect(
        screen.queryByRole("heading", { level: 3 }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId("multi-axis-chart-marker").parentElement,
      ).toHaveClass("-top-15", "bottom-4");
    });

    it("moves focus to the control that returns to the list", () => {
      renderChart();

      fireEvent.click(getOpenControl("Światopogląd"));

      expect(getCloseControl("Światopogląd")).toHaveFocus();
    });

    it("measures nothing", () => {
      const getBoundingClientRect = vi.spyOn(
        Element.prototype,
        "getBoundingClientRect",
      );

      renderChart();
      fireEvent.click(getOpenControl("Światopogląd"));

      expect(getBoundingClientRect).not.toHaveBeenCalled();

      getBoundingClientRect.mockRestore();
    });
  });

  describe("when the return control is pressed", () => {
    it("renders the list of groups again", () => {
      renderChart();

      fireEvent.click(getOpenControl("Gospodarka"));
      fireEvent.click(getCloseControl("Gospodarka"));

      expect(getGroups()).toHaveLength(3);
      expect(
        screen.queryByTestId("multi-axis-chart-open-group"),
      ).not.toBeInTheDocument();
    });

    it("moves focus back to the control of the group that was open", () => {
      renderChart();

      fireEvent.click(getOpenControl("Gospodarka"));
      fireEvent.click(getCloseControl("Gospodarka"));

      expect(getOpenControl("Gospodarka")).toHaveFocus();
    });

    it("lets another group be opened afterwards, one at a time", () => {
      renderChart();

      fireEvent.click(getOpenControl("Gospodarka"));
      fireEvent.click(getCloseControl("Gospodarka"));
      fireEvent.click(getOpenControl("Światopogląd"));

      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
      expect(getCloseControl("Światopogląd")).toHaveFocus();
    });
  });

  describe("when the open group disappears from the props", () => {
    const renderAndOpen = () => {
      const view = renderChart();

      fireEvent.click(getOpenControl("Światopogląd"));

      return (groups: AxisGroup[]) =>
        view.rerender(
          <I18nProvider i18n={i18n}>
            <MultiAxisChart title="Ideologie" groups={groups} />
          </I18nProvider>,
        );
    };

    it("returns to the list and moves focus to the first control", () => {
      const rerender = renderAndOpen();

      rerender([foreignPolicy, economy]);

      expect(getGroups()).toHaveLength(2);
      expect(getOpenControl("Gospodarka")).toHaveFocus();
    });

    it("moves focus to the card body when no group can be opened", () => {
      const rerender = renderAndOpen();

      rerender([foreignPolicy]);

      expect(screen.getByRole("list").parentElement).toHaveFocus();
    });

    it("returns to the list when the group is left with one axis", () => {
      const rerender = renderAndOpen();

      rerender([{ ...worldview, axes: [worldview.axes[0]] }, economy]);

      expect(getGroups()).toHaveLength(2);
      expect(getOpenControl("Gospodarka")).toHaveFocus();
    });

    it("does not take focus the close control did not have", () => {
      const rerender = renderAndOpen();

      fireEvent.blur(getCloseControl("Światopogląd"));
      (document.activeElement as HTMLElement).blur();
      rerender([economy]);

      expect(getOpenControl("Gospodarka")).not.toHaveFocus();
    });

    it("does not reopen the group when it comes back", () => {
      const rerender = renderAndOpen();

      rerender([economy]);
      rerender(GROUPS);

      expect(getGroups()).toHaveLength(3);
      expect(
        screen.queryByTestId("multi-axis-chart-open-group"),
      ).not.toBeInTheDocument();
    });

    it("keeps the group open when it is still there", () => {
      const rerender = renderAndOpen();

      rerender([economy, worldview]);

      expect(screen.getByTestId("multi-axis-chart-open-group")).toBeVisible();
      expect(getCloseControl("Światopogląd")).toHaveFocus();
    });
  });

  describe("given a comparison", () => {
    const comparison = {
      orientation: friend,
      values: { worldview: 90, force: 20, missing: 10 },
    };

    it("passes each axis value to its bar, closed and open", () => {
      renderChart({ comparison });

      expect(getBars().map((bar) => bar.getAttribute("aria-label"))).toEqual([
        "Progresywizm: 69%, Tradycjonalizm: 31%, porównanie z Ania: 90%",
        "Interwencjonizm: 31%, Wolny rynek: 69%",
        "Globalizm: 50%, Suwerenizm: 50%",
      ]);

      fireEvent.click(getOpenControl("Światopogląd"));

      expect(getBars().map((bar) => bar.getAttribute("aria-label"))).toEqual([
        "Progresywizm: 69%, Tradycjonalizm: 31%, porównanie z Ania: 90%",
        "Pacyfizm: 5%, Militaryzm: 95%, porównanie z Ania: 20%",
        "Sekularyzm: 60%, Religijność: 40%",
      ]);
    });

    it("ignores values for axes not in the module", () => {
      renderChart({ comparison });

      expect(
        screen.getAllByTestId("universal-axis-comparison-image"),
      ).toHaveLength(1);
    });

    it("ignores values that are not numbers and a comparison without an orientation", () => {
      renderChart({
        comparison: {
          orientation: friend,
          values: { worldview: "90" } as unknown as Record<string, number>,
        },
      });

      expect(
        screen.queryByTestId("universal-axis-comparison-image"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given marker is false", () => {
    it("renders no marker on any bar and no line through an open group", () => {
      renderChart({ marker: false });

      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();

      fireEvent.click(getOpenControl("Światopogląd"));

      expect(
        screen.queryByTestId("universal-axis-marker"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("multi-axis-chart-marker"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a group with no axes", () => {
    it("does not render it", () => {
      renderChart({
        groups: [
          { name: "Pusta", axes: [] },
          { name: "Bez osi" } as unknown as AxisGroup,
          null as unknown as AxisGroup,
          economy,
        ],
      });

      expect(getGroups()).toHaveLength(1);
      expect(screen.queryByText("Pusta")).not.toBeInTheDocument();
    });
  });

  describe("given a group without a name", () => {
    it("heads it with the lead alone", () => {
      renderChart({ groups: [{ axes: economy.axes }] });

      const heading = screen.getByRole("heading", { level: 3 });

      expect(heading.textContent).toBe("Wolny rynek");
      expect(heading.firstElementChild).toHaveClass("text-gi-primary");
    });

    it("names its control after the lead", () => {
      renderChart({ groups: [{ axes: economy.axes }] });

      expect(getOpenControl("Wolny rynek")).toBeVisible();
    });

    it("renders no heading on a tie and names its control after both poles", () => {
      renderChart({
        groups: [
          {
            axes: [
              createAxis("a", "Globalizm", "Suwerenizm", 50, 50),
              createAxis("b", "Pacyfizm", "Militaryzm", 5, 95),
            ],
          },
        ],
      });

      expect(
        screen.queryByRole("heading", { level: 3 }),
      ).not.toBeInTheDocument();
      expect(getOpenControl("Globalizm / Suwerenizm")).toBeVisible();
    });

    it("names its controls without a group when there is nothing to name it by", () => {
      renderChart({
        groups: [
          {
            axes: [
              createAxis("a", "", " ", 50, 50),
              createAxis("b", "Pacyfizm", "Militaryzm", 5, 95),
            ],
          },
        ],
      });

      fireEvent.click(screen.getByRole("button", { name: "Pokaż grupę" }));

      expect(
        screen.getByRole("button", { name: "Wróć do grup" }),
      ).toHaveFocus();
    });

    it("names its control after the only named pole of a tie", () => {
      renderChart({
        groups: [
          {
            axes: [
              createAxis("a", "", "Suwerenizm", 50, 50),
              createAxis("b", "Pacyfizm", "Militaryzm", 5, 95),
            ],
          },
        ],
      });

      expect(getOpenControl("Suwerenizm")).toBeVisible();
    });
  });

  describe("given an axis with one value absent", () => {
    it("leaves that side unfilled and lets the other side lead", () => {
      renderChart({
        groups: [
          {
            name: "Ustrój",
            axes: [
              createAxis("system", "Demokracja", "Autorytaryzm", undefined, 31),
            ],
          },
        ],
      });

      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "Ustrój — Autorytaryzm",
      );
      expect(screen.getByTestId("universal-axis-cap-start")).toBeVisible();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(getBars()[0]).toHaveAttribute(
        "aria-label",
        "Demokracja: brak wyniku, Autorytaryzm: 31%",
      );
    });
  });

  describe("given an axis with both values absent", () => {
    it("renders an empty double-sided track and a tie", () => {
      renderChart({
        groups: [
          {
            name: "Ustrój",
            axes: [createAxis("system", "Demokracja", "Autorytaryzm")],
          },
        ],
      });

      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "Ustrój",
      );
      expect(screen.getByTestId("universal-axis-cap-start")).toBeVisible();
      expect(screen.getByTestId("universal-axis-cap-end")).toBeVisible();
      expect(
        screen.queryByTestId("universal-axis-fill-start"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-fill-end"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given malformed input", () => {
    it("does not throw for groups that are not a list", () => {
      renderChart({ groups: undefined as unknown as AxisGroup[] });

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("does not throw for an axis with a missing entry", () => {
      renderChart({
        groups: [
          {
            name: "Ustrój",
            axes: [
              { id: "system" } as unknown as AxisPair,
              createAxis("b", "Pacyfizm", "Militaryzm", 5, 95),
            ],
          },
        ],
      });

      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "Ustrój",
      );
      expect(getOpenControl("Ustrój")).toBeVisible();
    });
  });

  describe("given no groups", () => {
    it("renders an empty card under its title", () => {
      renderChart({ groups: [] });

      expect(
        screen.getByRole("heading", { level: 2, name: "Ideologie" }),
      ).toBeVisible();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByRole("separator")).not.toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("given actions", () => {
    it("passes them through to the wrapper", () => {
      const onStatsClick = vi.fn();
      const onInfoClick = vi.fn();

      renderChart({ onStatsClick, onInfoClick });

      fireEvent.click(
        screen.getByRole("button", { name: "Statystyki: Ideologie" }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Informacje: Ideologie" }),
      );

      expect(onStatsClick).toHaveBeenCalledTimes(1);
      expect(onInfoClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("renders the groups as a list with headings", () => {
      renderChart();

      const items = within(screen.getByRole("list")).getAllByRole("listitem");

      expect(items).toHaveLength(3);
      expect(
        items.map(
          (item) => within(item).getByRole("heading", { level: 3 }).textContent,
        ),
      ).toEqual([
        "Światopogląd — Progresywizm",
        "Gospodarka — Wolny rynek",
        "Polityka zagraniczna",
      ]);
    });

    it("names the group on each control and says whether it is open", () => {
      renderChart();

      const openControl = getOpenControl("Światopogląd");

      expect(openControl).toHaveAttribute("aria-expanded", "false");
      expect(getOpenControl("Gospodarka")).toHaveAttribute(
        "aria-expanded",
        "false",
      );

      fireEvent.click(openControl);

      expect(getCloseControl("Światopogląd")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });

    it("renders the controls as native buttons, so they work from the keyboard", () => {
      renderChart();

      const openControl = getOpenControl("Światopogląd");

      expect(openControl.tagName).toBe("BUTTON");
      expect(openControl).toHaveAttribute("type", "button");
      expect(openControl).not.toHaveAttribute("tabindex");

      fireEvent.click(openControl);

      const closeControl = getCloseControl("Światopogląd");

      expect(closeControl.tagName).toBe("BUTTON");
      expect(closeControl).toHaveAttribute("type", "button");
    });

    it("gives both controls a pressable area at least 44px high", () => {
      renderChart();

      const openControl = getOpenControl("Światopogląd");

      expect(openControl).toHaveClass("w-full", "before:-inset-y-1.5");

      fireEvent.click(openControl);

      expect(getCloseControl("Światopogląd")).toHaveClass(
        "w-full",
        "h-[33px]",
        "before:-top-3",
      );
    });
  });
});
