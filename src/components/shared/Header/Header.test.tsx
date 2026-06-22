import { fireEvent, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { PATHS } from "@/constants/paths";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { Header } from "./Header";

vi.mock("@lingui/react/macro", () => ({
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@lingui/core/macro", () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}));

vi.mock("@/assets/vectors/debates-icon.svg", () => ({
  default: "debates-icon.svg",
}));
vi.mock("@/assets/vectors/hamburger-menu.svg", () => ({
  default: "hamburger-menu.svg",
}));
vi.mock("@/assets/vectors/mypoliticslogo-light.svg", () => ({
  default: "mypoliticslogo-light.svg",
}));
vi.mock("@/assets/vectors/quizzes-icon.svg", () => ({
  default: "quizzes-icon.svg",
}));
vi.mock("@/assets/vectors/polls-icon.svg", () => ({
  default: "polls-icon.svg",
}));

const renderHeader = (path: string = PATHS.home) => {
  renderWithI18n(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
};

describe("<Header />", () => {
  it("renders the logo linking to home", () => {
    renderHeader();

    expect(
      screen.getByRole("link", { name: /strona główna/i }),
    ).toHaveAttribute("href", PATHS.home);
  });

  it("renders all nav items", () => {
    renderHeader();

    const desktopNav = screen.getByTestId("desktopNav");

    expect(
      within(desktopNav).getByRole("link", { name: /debaty/i }),
    ).toBeInTheDocument();
    expect(
      within(desktopNav).getByRole("link", { name: /sondaże/i }),
    ).toBeInTheDocument();
    expect(
      within(desktopNav).getByRole("link", { name: /quizy/i }),
    ).toBeInTheDocument();
  });

  it("applies active style to current route", () => {
    renderHeader(PATHS.quizzes);

    expect(
      screen.getByRole("link", { current: "page", name: /quizy/i }),
    ).toHaveClass("bg-gi-primary");
  });

  it("opens and closes mobile menu", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: /otwórz menu nawigacji/i }),
    );

    expect(screen.getByTestId("mobileMenu")).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByTestId("mobileMenu")).getByRole("link", {
        name: /quizy/i,
      }),
    );

    expect(screen.queryByTestId("mobileMenu")).not.toBeInTheDocument();
  });

  it("closes mobile menu when clicking outside", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: /otwórz menu nawigacji/i }),
    );
    fireEvent.mouseDown(document.body);

    expect(screen.queryByTestId("mobileMenu")).not.toBeInTheDocument();
  });
});
