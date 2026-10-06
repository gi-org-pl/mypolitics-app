import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import type { AxisGroup } from "../MultiAxisChart.types";
import { useOpenGroup } from "./useOpenGroup";

const worldview: AxisGroup = {
  name: "Światopogląd",
  axes: [
    createAxisPair("worldview", "Progresywizm", "Tradycjonalizm", 69, 31),
    createAxisPair("force", "Pacyfizm", "Militaryzm", 5, 95),
  ],
};

const economy: AxisGroup = {
  name: "Gospodarka",
  axes: [
    createAxisPair("economy", "Interwencjonizm", "Wolny rynek", 31, 69),
    createAxisPair("taxes", "Redystrybucja", "Niskie podatki", 80, 20),
  ],
};

const foreignPolicy: AxisGroup = {
  name: "Polityka zagraniczna",
  axes: [createAxisPair("foreign", "Globalizm", "Suwerenizm", 50, 50)],
};

const Harness = ({ groups }: { groups: AxisGroup[] }) => {
  const {
    openGroup,
    bodyRef,
    openGroupById,
    closeGroup,
    setCloseControlFocused,
  } = useOpenGroup(groups);

  return (
    <div ref={bodyRef} tabIndex={-1} data-testid="body">
      {openGroup ? (
        <button
          type="button"
          onClick={closeGroup}
          onFocus={() => setCloseControlFocused(true)}
          onBlur={() => setCloseControlFocused(false)}
        >
          close {openGroup.name}
        </button>
      ) : (
        groups
          .filter((group) => group.axes.length > 1)
          .map((group) => (
            <button
              key={group.axes[0].id}
              type="button"
              data-group-id={group.axes[0].id}
              onClick={() => openGroupById(group.axes[0].id)}
            >
              open {group.name}
            </button>
          ))
      )}
    </div>
  );
};

const getControl = (name: string) => screen.getByRole("button", { name });

describe("useOpenGroup()", () => {
  describe("initially", () => {
    it("has no open group and moves no focus", () => {
      render(<Harness groups={[worldview, economy]} />);

      expect(screen.getAllByRole("button")).toHaveLength(2);
      expect(document.body).toHaveFocus();
    });
  });

  describe("when a group is opened", () => {
    it("returns that group", () => {
      const { result } = renderHook(() => useOpenGroup([worldview, economy]));

      act(() => result.current.openGroupById("economy"));

      expect(result.current.openGroup).toBe(economy);
    });

    it("moves focus to the close control", () => {
      render(<Harness groups={[worldview, economy]} />);

      fireEvent.click(getControl("open Gospodarka"));

      expect(getControl("close Gospodarka")).toHaveFocus();
    });

    it("does not open a group with one axis or an unknown group", () => {
      const { result } = renderHook(() => useOpenGroup([foreignPolicy]));

      act(() => result.current.openGroupById("foreign"));

      expect(result.current.openGroup).toBeUndefined();

      act(() => result.current.openGroupById("unknown"));

      expect(result.current.openGroup).toBeUndefined();
    });
  });

  describe("when the group is closed", () => {
    it("returns no open group and moves focus to the control of that group", () => {
      render(<Harness groups={[worldview, economy]} />);

      fireEvent.click(getControl("open Gospodarka"));
      fireEvent.click(getControl("close Gospodarka"));

      expect(getControl("open Gospodarka")).toHaveFocus();
    });
  });

  describe("when the open group disappears", () => {
    const renderAndOpen = () => {
      const view = render(<Harness groups={[worldview, economy]} />);

      fireEvent.click(getControl("open Światopogląd"));

      return view;
    };

    it("moves focus to the first control when the close control had it", () => {
      const { rerender } = renderAndOpen();

      rerender(<Harness groups={[foreignPolicy, economy]} />);

      expect(getControl("open Gospodarka")).toHaveFocus();
    });

    it("moves focus to the body when there is no control", () => {
      const { rerender } = renderAndOpen();

      rerender(<Harness groups={[foreignPolicy]} />);

      expect(screen.getByTestId("body")).toHaveFocus();
    });

    it("treats a group left with one axis as gone", () => {
      const { rerender } = renderAndOpen();

      rerender(
        <Harness
          groups={[{ ...worldview, axes: [worldview.axes[0]] }, economy]}
        />,
      );

      expect(getControl("open Gospodarka")).toHaveFocus();
    });

    it("leaves focus alone when the close control did not have it", () => {
      const { rerender } = renderAndOpen();

      fireEvent.blur(getControl("close Światopogląd"));
      (document.activeElement as HTMLElement).blur();
      rerender(<Harness groups={[economy]} />);

      expect(getControl("open Gospodarka")).not.toHaveFocus();
    });

    it("does not reopen the group when it comes back", () => {
      const { rerender } = renderAndOpen();

      rerender(<Harness groups={[economy]} />);
      rerender(<Harness groups={[worldview, economy]} />);

      expect(getControl("open Światopogląd")).toBeVisible();
    });

    it("keeps the group open when it only moved", () => {
      const { rerender } = renderAndOpen();

      rerender(<Harness groups={[economy, worldview]} />);

      expect(getControl("close Światopogląd")).toHaveFocus();
    });
  });

  describe("given no body element", () => {
    it("does not throw when focus should move", () => {
      const { result } = renderHook(() => useOpenGroup([worldview]));

      act(() => result.current.openGroupById("worldview"));
      act(() => result.current.closeGroup());

      expect(result.current.openGroup).toBeUndefined();
    });
  });
});
