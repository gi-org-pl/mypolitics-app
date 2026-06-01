import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders copyright with current year", () => {
    renderWithI18n(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const currentYear = new Date().getFullYear();
    // Using a more flexible matcher since the text might be split
    expect(
      screen.getByText((content) => content.includes(`© ${currentYear}`)),
    ).toBeInTheDocument();
  });

  it("renders myPolitics logo", () => {
    renderWithI18n(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("footer-mypolitics-logo")).toBeInTheDocument();
  });

  it("renders Generacja Innowacja logo with link", () => {
    renderWithI18n(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const giLink = screen.getByRole("link", { name: /Generacja Innowacja/i });
    expect(giLink).toHaveAttribute("href", "https://gi.org.pl");
    expect(giLink).toHaveAttribute("target", "_blank");
  });

  it("renders social links", () => {
    renderWithI18n(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    // 7 social links
    const links = screen.getAllByRole("link");
    const socialLinks = links.filter(
      (link) =>
        link.getAttribute("href")?.startsWith("http") &&
        !link.getAttribute("href")?.includes("gi.org.pl"),
    );
    expect(socialLinks).toHaveLength(7);
  });

  it("renders legal links", () => {
    renderWithI18n(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Regulamin/i)).toBeInTheDocument();
    expect(screen.getByText(/Prywatność/i)).toBeInTheDocument();
    expect(screen.getByText(/O nas/i)).toBeInTheDocument();
  });
});
