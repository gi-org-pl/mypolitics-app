import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NotFound from "./$";

vi.mock("@/components/shared/Error404/Error404", () => ({
  Error404: () => <div data-testid="error-404">Error 404</div>,
}));

describe("<NotFound /> page", () => {
  describe("when a user lands on an unknown route", () => {
    it("renders the Error404 component", () => {
      render(<NotFound />);
      expect(screen.getByTestId("error-404")).toBeInTheDocument();
    });
  });
});
