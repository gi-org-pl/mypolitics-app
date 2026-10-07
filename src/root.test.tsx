import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";
import App from "./root";

const ROUTE_CONTENT = "Treść strony";

const RouteContent = () => <p>{ROUTE_CONTENT}</p>;

const renderApp = () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: App,
      children: [{ index: true, Component: RouteContent }],
    },
  ]);

  render(<Stub initialEntries={["/"]} />, { container: document });
};

describe("root App", () => {
  describe("given any route", () => {
    it("renders the header", () => {
      renderApp();

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("renders the footer", () => {
      renderApp();

      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("renders the route content inside main", () => {
      renderApp();

      expect(
        within(screen.getByRole("main")).getByText(ROUTE_CONTENT),
      ).toBeInTheDocument();
    });

    it("renders header, main and footer in that order", () => {
      renderApp();

      const header = screen.getByRole("banner");
      const main = screen.getByRole("main");
      const footer = screen.getByRole("contentinfo");

      expect(header.compareDocumentPosition(main)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(main.compareDocumentPosition(footer)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    it("renders nothing of its own inside main besides the route content", () => {
      renderApp();

      expect(screen.getByRole("main")).toHaveTextContent(
        new RegExp(`^${ROUTE_CONTENT}$`),
      );
    });

    it("declares the language of the page", () => {
      renderApp();

      expect(document.documentElement).toHaveAttribute("lang", "pl");
    });
  });
});
