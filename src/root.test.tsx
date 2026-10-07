import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";
import App, { Layout } from "./root";

const ROUTE_CONTENT = "Treść strony";

const RouteContent = () => <p>{ROUTE_CONTENT}</p>;

const Document = () => (
  <Layout>
    <p>{ROUTE_CONTENT}</p>
  </Layout>
);

const renderApp = () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: App,
      children: [{ index: true, Component: RouteContent }],
    },
  ]);

  render(<Stub initialEntries={["/"]} />);
};

const renderDocument = () => {
  const Stub = createRoutesStub([{ path: "/", Component: Document }]);

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
  });
});

describe("root Layout", () => {
  describe("given any content", () => {
    it("renders the content in the body of the document", () => {
      renderDocument();

      expect(within(document.body).getByText(ROUTE_CONTENT)).toBeVisible();
    });

    it("declares the language of the app", () => {
      renderDocument();

      expect(document.documentElement).toHaveAttribute("lang", "pl");
    });

    it("sets the viewport to the width of the device", () => {
      renderDocument();

      expect(
        document.head.querySelector('meta[name="viewport"]'),
      ).toHaveAttribute("content", "width=device-width, initial-scale=1");
    });

    it("titles the document", () => {
      renderDocument();

      expect(document.title).toBe("mypolitics");
    });
  });
});
