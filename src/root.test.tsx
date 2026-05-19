import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import App from "./root";


vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    Scripts: () => <div data-testid="scripts" />,
    ScrollRestoration: () => null,
  };
});

vi.mock("./components/shared/Header/Header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock("./components/shared/Footer/Footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe("root App", () => {
  describe("structure", () => {
    it("renders the Header", () => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    it("renders the Footer", () => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("renders child route content via Outlet", () => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
      // Sprawdzamy czy tag main istnieje - to w nim siedzi Outlet
      expect(document.querySelector("main")).toBeInTheDocument();
    });
  });

  describe("sticky footer", () => {
    it("pushes the footer to the bottom when content is short", () => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );
      
      const container = document.querySelector(".flex.min-h-screen.flex-col");
      const main = document.querySelector("main");
      
      expect(container).toBeInTheDocument();
      expect(main).toHaveClass("flex-1");
    });
  });
});
