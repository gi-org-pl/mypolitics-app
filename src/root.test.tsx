import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SITE_NAME } from "./constants/document";
import { PATHS } from "./constants/paths";
import { VIEW_VISIT_STORAGE_KEY_PREFIX } from "./constants/storage";
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
        {
          path: PATHS.terms,
          Component: NextRouteContent,
          meta: () => [{ name: "robots", content: "noindex" }],
        },
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

  describe("given the route on screen", () => {
    it("hands it to the header, which notes the visit of its view", () => {
      sessionStorage.clear();
      renderRoot();

      expect(
        Object.keys(sessionStorage).filter((key) =>
          key.startsWith(VIEW_VISIT_STORAGE_KEY_PREFIX),
        ),
      ).toHaveLength(1);
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

      expect(document.title).toBe("myPolitics");
    });

    it("links the favicon as an SVG and as an icon file with three sizes", () => {
      renderRoot();

      expect(
        document.head.querySelector('link[rel="icon"][type="image/svg+xml"]'),
      ).toHaveAttribute("href", "/favicon.svg");
      expect(
        document.head.querySelector('link[rel="icon"][type="image/x-icon"]'),
      ).toHaveAttribute("sizes", "16x16 32x32 48x48");
    });

    it("links the touch icon and the web manifest", () => {
      renderRoot();

      expect(
        document.head.querySelector('link[rel="apple-touch-icon"]'),
      ).toHaveAttribute("href", "/apple-touch-icon.png");
      expect(
        document.head.querySelector('link[rel="manifest"]'),
      ).toHaveAttribute("href", "/site.webmanifest");
    });

    it("gives link previews the share image by its absolute address and size", () => {
      renderRoot();

      const content = (selector: string) =>
        document.head.querySelector(selector)?.getAttribute("content");

      expect(content('meta[property="og:image"]')).toBe(
        "https://mypolitics.pl/og-image.png",
      );
      expect(content('meta[property="og:image:width"]')).toBe("1200");
      expect(content('meta[property="og:image:height"]')).toBe("630");
      expect(content('meta[property="og:image:alt"]')).toBe("Logo myPolitics");
      expect(content('meta[property="og:site_name"]')).toBe("myPolitics");
    });

    it("asks for the large image card where links are shared on X", () => {
      renderRoot();

      expect(
        document.head.querySelector('meta[name="twitter:card"]'),
      ).toHaveAttribute("content", "summary_large_image");
      expect(
        document.head.querySelector('meta[name="twitter:image"]'),
      ).toHaveAttribute("content", "https://mypolitics.pl/og-image.png");
    });

    it("asks nothing of search engines for a route that asks nothing", () => {
      renderRoot();

      expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    });
  });

  describe("given a route that asks not to be indexed", () => {
    it("puts that into the head of the document, and keeps the title", async () => {
      renderRoot();

      fireEvent.click(screen.getByRole("link", { name: "Regulamin" }));

      expect(await screen.findByText(NEXT_ROUTE_CONTENT)).toBeVisible();
      expect(
        document.head.querySelector('meta[name="robots"]'),
      ).toHaveAttribute("content", "noindex");
      expect(document.title).toBe(SITE_NAME);
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
