import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PATHS } from "./constants/paths";
import App, { HydrateFallback, Layout } from "./root";

const ROUTE_CONTENT = "Treść strony";
const NEXT_ROUTE_CONTENT = "Treść następnej strony";

const RouteContent = () => <p>{ROUTE_CONTENT}</p>;

const NextRouteContent = () => <p>{NEXT_ROUTE_CONTENT}</p>;

// The way React Router nests the exports of the root route.
const Root = () => (
  <Layout>
    <App />
  </Layout>
);

// Every test renders into the document itself, as the app does. React attaches
// its event listeners to `document` only when no other root was created in it
// before, so no test of this file may render into a plain container.
const renderRoot = () => {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: Root,
      children: [
        { index: true, Component: RouteContent },
        { path: PATHS.terms, Component: NextRouteContent },
      ],
    },
  ]);

  render(<Stub initialEntries={["/"]} />, { container: document });
};

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("root App", () => {
  describe("given any route", () => {
    it("renders the header", () => {
      renderRoot();

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("renders the footer", () => {
      renderRoot();

      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("renders the route content inside main", () => {
      renderRoot();

      expect(
        within(screen.getByRole("main")).getByText(ROUTE_CONTENT),
      ).toBeInTheDocument();
    });

    it("renders header, main and footer in that order", () => {
      renderRoot();

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
      renderRoot();

      expect(screen.getByRole("main")).toHaveTextContent(
        new RegExp(`^${ROUTE_CONTENT}$`),
      );
    });
  });

  describe("when the user follows a link to another page", () => {
    it("replaces the route content and keeps the shell", async () => {
      renderRoot();

      fireEvent.click(screen.getByRole("link", { name: "Regulamin" }));

      expect(
        await within(screen.getByRole("main")).findByText(NEXT_ROUTE_CONTENT),
      ).toBeVisible();
      expect(screen.queryByText(ROUTE_CONTENT)).not.toBeInTheDocument();
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
  });
});

describe("root Layout", () => {
  describe("given any content", () => {
    it("renders the content in the body of the document", () => {
      renderRoot();

      expect(within(document.body).getByText(ROUTE_CONTENT)).toBeVisible();
    });

    it("declares the language of the app", () => {
      renderRoot();

      expect(document.documentElement).toHaveAttribute("lang", "pl");
    });

    it("sets the viewport to the width of the device", () => {
      renderRoot();

      expect(
        document.head.querySelector('meta[name="viewport"]'),
      ).toHaveAttribute("content", "width=device-width, initial-scale=1");
    });

    it("titles the document", () => {
      renderRoot();

      expect(document.title).toBe("mypolitics");
    });
  });

  describe("when the user follows a link to another page", () => {
    it("starts the new page at the top", async () => {
      renderRoot();
      vi.mocked(window.scrollTo).mockClear();

      fireEvent.click(screen.getByRole("link", { name: "Regulamin" }));

      expect(await screen.findByText(NEXT_ROUTE_CONTENT)).toBeVisible();
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });
});

describe("root HydrateFallback", () => {
  describe("while the scripts of the app are loading", () => {
    it("renders nothing", () => {
      expect(HydrateFallback()).toBeNull();
    });
  });
});
