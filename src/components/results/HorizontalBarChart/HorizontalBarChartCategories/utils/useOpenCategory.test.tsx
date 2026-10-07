import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useOpenCategory } from "./useOpenCategory";

interface HarnessProps {
  keys: string[];
}

const Harness = ({ keys }: HarnessProps) => {
  const { openKey, open, close, registerControl, returnControl } =
    useOpenCategory(keys);

  return openKey === null ? (
    <div>
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          ref={registerControl(key)}
          onClick={() => open(key)}
        >
          {`open ${key}`}
        </button>
      ))}
    </div>
  ) : (
    <button type="button" ref={returnControl} onClick={close}>
      {`close ${openKey}`}
    </button>
  );
};

const press = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

describe("useOpenCategory()", () => {
  describe("given a list of keys", () => {
    it("starts with nothing open", () => {
      const { result } = renderHook(() => useOpenCategory(["a", "b"]));

      expect(result.current.openKey).toBeNull();
    });
  });

  describe("when a category is opened", () => {
    it("returns its key", () => {
      const { result } = renderHook(() => useOpenCategory(["a", "b"]));

      act(() => result.current.open("b"));

      expect(result.current.openKey).toBe("b");
    });

    it("moves focus to the return control", () => {
      render(<Harness keys={["a", "b"]} />);

      press("open b");

      expect(screen.getByRole("button", { name: "close b" })).toHaveFocus();
    });
  });

  describe("when another category is opened", () => {
    it("replaces the open one", () => {
      const { result } = renderHook(() => useOpenCategory(["a", "b"]));

      act(() => result.current.open("a"));
      act(() => result.current.open("b"));

      expect(result.current.openKey).toBe("b");
    });
  });

  describe("when the open category is closed", () => {
    it("returns nothing open", () => {
      const { result } = renderHook(() => useOpenCategory(["a", "b"]));

      act(() => result.current.open("b"));
      act(() => result.current.close());

      expect(result.current.openKey).toBeNull();
    });

    it("moves focus to the control of the category that was open", () => {
      render(<Harness keys={["a", "b"]} />);

      press("open b");
      press("close b");

      expect(screen.getByRole("button", { name: "open b" })).toHaveFocus();
    });
  });

  describe("when close is called with nothing open", () => {
    it("stays closed and moves no focus", () => {
      const { result } = renderHook(() => useOpenCategory(["a"]));

      act(() => result.current.close());

      expect(result.current.openKey).toBeNull();
      expect(document.body).toHaveFocus();
    });
  });

  describe("given an open category and a list that changes", () => {
    it("keeps it open when other keys are removed, added or reordered", () => {
      const { result, rerender } = renderHook(
        ({ keys }) => useOpenCategory(keys),
        { initialProps: { keys: ["a", "b", "c"] } },
      );

      act(() => result.current.open("b"));
      rerender({ keys: ["b", "c"] });
      expect(result.current.openKey).toBe("b");

      rerender({ keys: ["x", "c", "b"] });
      expect(result.current.openKey).toBe("b");
    });

    it("closes when its key is no longer listed", () => {
      const { result, rerender } = renderHook(
        ({ keys }) => useOpenCategory(keys),
        { initialProps: { keys: ["a", "b"] } },
      );

      act(() => result.current.open("b"));
      rerender({ keys: ["a"] });

      expect(result.current.openKey).toBeNull();
    });

    it("stays closed when the key comes back", () => {
      const { result, rerender } = renderHook(
        ({ keys }) => useOpenCategory(keys),
        { initialProps: { keys: ["a", "b"] } },
      );

      act(() => result.current.open("b"));
      rerender({ keys: ["a"] });
      rerender({ keys: ["a", "b"] });

      expect(result.current.openKey).toBeNull();
    });
  });

  describe("when a key that is not listed is opened", () => {
    it("stays closed", () => {
      const { result } = renderHook(() => useOpenCategory(["a"]));

      act(() => result.current.open("zulu"));

      expect(result.current.openKey).toBeNull();
    });
  });

  describe("given a registered control that unmounts", () => {
    it("forgets it without failing", () => {
      const { rerender } = render(<Harness keys={["a", "b"]} />);

      rerender(<Harness keys={["a"]} />);

      expect(
        screen.queryByRole("button", { name: "open b" }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "open a" })).toBeEnabled();
    });
  });
});
