import { act, render, screen } from "@testing-library/react";
import { createMemoryRouter, Link, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { useOnNavigation } from "./useOnNavigation";

const Page = ({ onNavigation }: { onNavigation: () => void }) => {
  useOnNavigation(onNavigation);

  return <Link to="/quizzes">quizzes</Link>;
};

const renderPage = () => {
  const onNavigation = vi.fn();
  const router = createMemoryRouter(
    [{ path: "*", element: <Page onNavigation={onNavigation} /> }],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);

  return { onNavigation, router };
};

describe("useOnNavigation()", () => {
  describe("given the first render", () => {
    it("does not call back", () => {
      const { onNavigation } = renderPage();

      expect(onNavigation).not.toHaveBeenCalled();
    });
  });

  describe("when a link is followed", () => {
    it("calls back once", () => {
      const { onNavigation } = renderPage();

      act(() => screen.getByRole("link", { name: "quizzes" }).click());

      expect(onNavigation).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the page already open is opened again", () => {
    it("calls back", async () => {
      const { onNavigation, router } = renderPage();

      await act(() => router.navigate("/"));

      expect(onNavigation).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the browser goes back", () => {
    it("calls back for each move", async () => {
      const { onNavigation, router } = renderPage();

      await act(() => router.navigate("/quizzes"));
      await act(() => router.navigate(-1));

      expect(onNavigation).toHaveBeenCalledTimes(2);
    });
  });
});
