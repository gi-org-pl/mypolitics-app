vi.mock("@lingui/react/macro", () => ({
  Trans: ({ children }: any) => children,
  useLingui: () => ({ t: (strings: TemplateStringsArray) => strings[0] }),
}));

vi.mock("@lingui/core/macro", () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { PATHS } from "@/constants/paths";
import { Error404 } from "./Error404";

const renderError = () => {
  render(
    <MemoryRouter>
      <Error404 />
    </MemoryRouter>,
  );
};

describe("<Error404 />", () => {
  describe("content", () => {
    it("renders the 404 heading", () => {
      renderError();

      expect(
        screen.getByText(/to jest błąd 404/i).closest("h1"),
      ).toBeInTheDocument();
    });

    it("renders the teal highlighted portion of the heading", () => {
      renderError();
      
      expect(
        screen.getByText(/na miarę naszych możliwości/i),
      ).toBeInTheDocument();
    });

    it("renders the body text", () => {
      renderError();
      
      expect(
        screen.getByText(/my tym błędem otwieramy oczy niedowiarkom!/i),
      ).toBeInTheDocument();
    });

    it("renders the bear illustration with an alt attribute", () => {
      renderError();
      
      const img = screen.getByAltText(/ilustracja misia/i);

      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src");
    });
  });

  describe('when "Strona główna" button is clicked', () => {
    it("navigates to the home path", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/404"]}>
          <Error404 />
        </MemoryRouter>,
      );

      const link = screen.getByRole("link", {
        name: /strona główna/i,
      });

      expect(link).toHaveAttribute("href", PATHS.home);

      await user.click(link);
    });
  });
});
