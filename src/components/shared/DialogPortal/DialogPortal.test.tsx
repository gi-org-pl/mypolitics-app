import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DialogPortal } from "./DialogPortal";

describe("<DialogPortal />", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("given children", () => {
    it("renders them as children of the body", () => {
      render(
        <DialogPortal>
          <p>Treść okna</p>
        </DialogPortal>,
      );

      expect(screen.getByText("Treść okna").parentElement).toBe(document.body);
    });
  });

  describe("given a transformed ancestor", () => {
    it("renders the children outside that ancestor", () => {
      render(
        <div data-testid="ancestor" style={{ transform: "scale(1)" }}>
          <DialogPortal>
            <p>Treść okna</p>
          </DialogPortal>
        </div>,
      );

      expect(screen.getByTestId("ancestor")).not.toContainElement(
        screen.getByText("Treść okna"),
      );
    });
  });

  describe("when it is unmounted", () => {
    it("removes the children from the body", () => {
      const { unmount } = render(
        <DialogPortal>
          <p>Treść okna</p>
        </DialogPortal>,
      );

      unmount();

      expect(screen.queryByText("Treść okna")).not.toBeInTheDocument();
    });
  });

  describe("given no document, as in a render on the server", () => {
    it("renders nothing", () => {
      vi.stubGlobal("document", undefined);

      expect(
        renderToString(
          <DialogPortal>
            <p>Treść okna</p>
          </DialogPortal>,
        ),
      ).toBe("");
    });
  });
});
