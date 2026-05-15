
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { PATHS } from "@/constants/paths";
import Header from "./Header";

vi.mock("@lingui/react/macro", () => ({
  Trans: ({ children }: any) => children,
  useLingui: () => ({ t: (strings: TemplateStringsArray) => strings[0] }),
}));

vi.mock("@lingui/core/macro", () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}));

const renderHeader = (path: string = PATHS.home) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
};

const viewportMobile = (width: number) => { Object.defineProperty(window, "innerWidth", {value: width}) }


describe("<Header />", () => {
  describe("on desktop", () => {
    it("renders the myPolitics logo linking to home", () => {
        renderHeader();

        expect(
            screen.getByRole('link', { name: 'logo' })
        ).toHaveAttribute('href', PATHS.home)
    });
    it("renders all three nav items", () => {
        renderHeader();

        expect(screen.getByRole("link", { name: /debaty/i }),).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /sondaze/i }),).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /quizy/i }),).toBeInTheDocument();
    });
    it("applies the active style to the current route", () => {
        renderHeader(PATHS.quizzes);

        const quizyLink = screen.getByRole('link', { name: /quizy/i});
        expect(quizyLink.querySelector('button')).toHaveClass("bg-gi-primary")
    });
    it("does not show the hamburger button", () => {
        renderHeader();

        const hamburger = screen.getByAltText(/menu/i);
        expect(hamburger).not.toHaveClass('hidden');
    });
  });


    describe('on mobile', () => {
        viewportMobile(375);
        it('shows the hamburger button and hides nav items', ()=>{
            renderHeader();

            const hamburger = screen.getByRole('button', {name: /menu/i});
            expect(hamburger).toBeVisible();

            const menu = screen.getByTestId("desktopNav");
            expect(menu).toHaveClass('hidden');
        });

        describe('when the hamburger is clicked', () => {

            it('opens the mobile navigation menu', ()=>{
                renderHeader(PATHS.quizzes);

                const hamburger = screen.getByRole('button', {name: /menu/i});
                fireEvent.click(hamburger);

                const quizyLink = screen.getAllByText(/quizy/i)[0];
                expect(quizyLink).toBeVisible();
            });
            it('closes the menu when a nav item is clicked', ()=>{
                renderHeader(PATHS.quizzes);

                const hamburger = screen.getByRole('button', {name: /menu/i});
                fireEvent.click(hamburger);

                const menu = screen.queryByTestId("mobileMenu");
                expect(menu).toBeVisible();

                const quizyLink = screen.getAllByText(/quizy/i)[0];
                fireEvent.click(quizyLink);
                expect(menu).not.toBeVisible();
            });
            it('closes the menu when clicking outside', ()=>{
                renderHeader();

                const hamburger = screen.getByRole('button', {name: /menu/i});
                fireEvent.click(hamburger);

                const menu = screen.getByTestId("mobileMenu");
                expect(menu).toBeVisible();

                fireEvent.mouseDown(document.body);
                expect(menu).not.toBeVisible();
            });
        });
    });
});