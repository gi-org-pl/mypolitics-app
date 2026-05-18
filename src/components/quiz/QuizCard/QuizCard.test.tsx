import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { messages as plMessages } from "@/locales/pl/messages";
import { useMinWidthMd } from "@/utils/useMinWidthMd";

import { QuizCard } from "./QuizCard";

vi.mock("@/utils/useMinWidthMd", () => ({
  useMinWidthMd: vi.fn(),
}));

const mockedUseMinWidthMd = vi.mocked(useMinWidthMd);

function renderWithI18n(ui: ReactElement): ReturnType<typeof render> {
  i18n.load({ pl: plMessages });
  i18n.activate("pl");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
}

const noop = (): void => {};

describe("<QuizCard />", () => {
  beforeEach(() => {
    mockedUseMinWidthMd.mockReturnValue(false);
  });

  describe("given a logoUrl", () => {
    it("renders the logo image", () => {
      renderWithI18n(
        <QuizCard
          logoUrl="https://example.com/logo.png"
          title="Quiz title"
          description="Opis"
          tags={[]}
          onButtonClick={noop}
        />,
      );

      const img = screen.getByRole("img", { name: "Quiz title" });
      expect(img).toHaveAttribute("src", "https://example.com/logo.png");
      expect(img).toHaveAttribute("height", "32");
    });
  });

  describe("given no logoUrl but a title", () => {
    it("renders the title as text logo", () => {
      renderWithI18n(
        <QuizCard
          title="Generacja Innowacja"
          description="Opis"
          tags={[]}
          onButtonClick={noop}
        />,
      );

      expect(
        screen.getByRole("heading", { level: 2, name: "Generacja Innowacja" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a backgroundUrl", () => {
    it("renders the background image", () => {
      renderWithI18n(
        <QuizCard
          backgroundUrl="https://example.com/bg.jpg"
          description="Opis"
          tags={[]}
          onButtonClick={noop}
        />,
      );

      const bg = document.querySelector(
        'img[src="https://example.com/bg.jpg"]',
      ) as HTMLImageElement | null;
      expect(bg).not.toBeNull();
      expect(bg).toHaveClass("object-cover");
    });

    describe("on mobile", () => {
      it("does not show the chevron and always shows description and tags", () => {
        renderWithI18n(
          <QuizCard
            backgroundUrl="https://example.com/bg.jpg"
            description="Widoczny opis z tłem"
            tags={["Chip"]}
            onButtonClick={noop}
          />,
        );

        expect(
          screen.queryByRole("button", { name: "Rozwiń" }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Zwiń" }),
        ).not.toBeInTheDocument();
        expect(screen.getByText("Widoczny opis z tłem")).toBeVisible();
        expect(screen.getByText("Chip")).toBeVisible();
      });

      it("uses the default card surface below the hero image", () => {
        renderWithI18n(
          <QuizCard
            backgroundUrl="https://example.com/bg.jpg"
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        const description = screen.getByText("Opis");
        const contentBlock = description.closest(".p-4");
        expect(contentBlock?.className).toContain("bg-gi-ash");
      });
    });
  });

  describe("given a cta", () => {
    it("renders the CTA badge", () => {
      renderWithI18n(
        <QuizCard
          cta="Nowy quiz"
          description="Opis"
          tags={[]}
          onButtonClick={noop}
        />,
      );

      expect(screen.getByText("Nowy quiz")).toBeInTheDocument();
    });
  });

  describe("given description as ReactNode", () => {
    it("renders formatted body in a div", () => {
      renderWithI18n(
        <QuizCard
          description={
            <>
              <b>Bold bit</b> <span>rest</span>
            </>
          }
          tags={[]}
          onButtonClick={noop}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Rozwiń" }));

      expect(screen.getByText("Bold bit")).toBeVisible();
      expect(screen.getByText("rest")).toBeVisible();
    });
  });

  describe("given tags", () => {
    it("renders all tag chips", () => {
      renderWithI18n(
        <QuizCard
          description="Opis"
          tags={["+1.5M osób", "15 min"]}
          onButtonClick={noop}
        />,
      );

      expect(screen.getByText("+1.5M osób")).toBeInTheDocument();
      expect(screen.getByText("15 min")).toBeInTheDocument();
    });

    it("renders nothing in the tag row when tags is empty", () => {
      renderWithI18n(
        <QuizCard
          isAlwaysExpanded
          description="Opis"
          tags={[]}
          onButtonClick={noop}
        />,
      );

      expect(screen.queryByText("+1.5M osób")).not.toBeInTheDocument();
    });
  });

  describe("given isHighlighted with cta and no backgroundUrl", () => {
    it("renders the CTA strip at the top of the card", () => {
      renderWithI18n(
        <QuizCard
          isHighlighted
          cta="Top badge"
          description="Opis"
          tags={[]}
          onButtonClick={noop}
        />,
      );

      const article = screen.getByRole("article");
      expect(article.firstChild).toHaveTextContent("Top badge");
    });
  });

  describe("given backgroundUrl and cta", () => {
    it("renders the CTA strip under the hero with corner badge styling", () => {
      renderWithI18n(
        <QuizCard
          backgroundUrl="https://example.com/bg.jpg"
          cta="Corner CTA"
          description="Opis"
          tags={[]}
          onButtonClick={noop}
        />,
      );

      expect(screen.getByText("Corner CTA")).toBeInTheDocument();
      expect(screen.getByText("Corner CTA").className).toContain(
        "rounded-br-2xl",
      );
    });
  });

  describe("expand / collapse (mobile)", () => {
    describe("when the card is not highlighted and not alwaysExpanded", () => {
      it("starts collapsed on mobile", () => {
        renderWithI18n(
          <QuizCard
            description="Ukryty opis"
            tags={["Chip"]}
            onButtonClick={noop}
          />,
        );

        const expander = screen.getByRole("button", { name: "Rozwiń" });
        expect(expander).toHaveAttribute("aria-expanded", "false");

        const grid = expander
          .closest("div")
          ?.parentElement?.parentElement?.querySelector("[aria-hidden]");
        expect(grid).toHaveAttribute("aria-hidden", "true");
      });

      it("shows the chevron button", () => {
        renderWithI18n(
          <QuizCard description="Opis" tags={[]} onButtonClick={noop} />,
        );

        expect(
          screen.getByRole("button", { name: "Rozwiń" }),
        ).toBeInTheDocument();
      });

      describe("when the chevron is clicked", () => {
        it("expands to show description and tags", () => {
          renderWithI18n(
            <QuizCard
              description="Rozwinięty opis"
              tags={["Tag A"]}
              onButtonClick={noop}
            />,
          );

          fireEvent.click(screen.getByRole("button", { name: "Rozwiń" }));

          expect(screen.getByRole("button", { name: "Zwiń" })).toHaveAttribute(
            "aria-expanded",
            "true",
          );
          expect(screen.getByText("Rozwinięty opis")).toBeVisible();
          expect(screen.getByText("Tag A")).toBeVisible();
        });

        it("changes the chevron direction", () => {
          renderWithI18n(
            <QuizCard description="Opis" tags={[]} onButtonClick={noop} />,
          );

          const chevronBtn = screen.getByRole("button", { name: "Rozwiń" });
          const imgBefore = chevronBtn.querySelector("img");
          expect(imgBefore?.className).not.toContain("rotate-180");

          fireEvent.click(chevronBtn);

          const chevronBtnAfter = screen.getByRole("button", { name: "Zwiń" });
          const imgAfter = chevronBtnAfter.querySelector("img");
          expect(imgAfter?.className).toContain("rotate-180");
        });
      });
    });

    describe("when isAlwaysExpanded is true", () => {
      it("does not show the chevron", () => {
        renderWithI18n(
          <QuizCard
            isAlwaysExpanded
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        expect(
          screen.queryByRole("button", { name: "Rozwiń" }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Zwiń" }),
        ).not.toBeInTheDocument();
      });

      it("always shows description and tags", () => {
        renderWithI18n(
          <QuizCard
            isAlwaysExpanded
            description="Widoczny opis"
            tags={["T1"]}
            onButtonClick={noop}
          />,
        );

        expect(screen.getByText("Widoczny opis")).toBeVisible();
        expect(screen.getByText("T1")).toBeVisible();
      });
    });

    describe("when viewport is at least md", () => {
      it("does not set aria-hidden on the collapsible grid", () => {
        mockedUseMinWidthMd.mockReturnValue(true);
        renderWithI18n(
          <QuizCard
            description="Desktop opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        expect(screen.getByText("Desktop opis")).toBeVisible();

        const grid = document.querySelector('[class*="grid-template-rows"]');
        expect(grid?.getAttribute("aria-hidden")).toBeNull();
      });
    });

    describe("when isHighlighted is true", () => {
      it("does not show the chevron", () => {
        renderWithI18n(
          <QuizCard
            isHighlighted
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        expect(
          screen.queryByRole("button", { name: "Rozwiń" }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("play button", () => {
    describe("when isButtonLoading is true", () => {
      it("shows a spinner instead of the play icon", () => {
        renderWithI18n(
          <QuizCard
            isButtonLoading
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        const play = screen.getByRole("button", { name: "Rozpocznij quiz" });
        const spinner = play.querySelector(".animate-spin");
        expect(spinner).toBeTruthy();
        expect(play.querySelector('img[src*="play"]')).toBeNull();
      });
    });

    describe("when isButtonDisabled is true", () => {
      it("hides the play button", () => {
        renderWithI18n(
          <QuizCard
            isButtonDisabled
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        expect(
          screen.queryByRole("button", { name: "Rozpocznij quiz" }),
        ).not.toBeInTheDocument();
      });

      it("keeps the header row at 48px height", () => {
        renderWithI18n(
          <QuizCard
            isButtonDisabled
            title="Generacja Innowacja"
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        const headerRow = screen
          .getByRole("heading", { name: "Generacja Innowacja" })
          .closest(".h-12");
        expect(headerRow).not.toBeNull();
        expect(headerRow?.className).toContain("min-h-12");
      });
    });

    describe("when isHighlighted is true and isMainAction is false", () => {
      it("renders the secondary play control with play icon", () => {
        renderWithI18n(
          <QuizCard
            isHighlighted
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        const play = screen.getByRole("button", { name: "Rozpocznij quiz" });
        expect(play.className).toContain("bg-gi-primary/10");
        expect(play.className).toContain("border-gi-primary");
        expect(play.querySelector("svg")).toBeTruthy();
      });
    });

    describe("when isMainAction is true", () => {
      it("renders the button with primary variant", () => {
        renderWithI18n(
          <QuizCard
            isMainAction
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        const play = screen.getByRole("button", { name: "Rozpocznij quiz" });
        expect(play.className).toContain("bg-gi-primary");
        expect(play.className).toContain("border-0");
      });
    });

    describe("when isShowStartText is true", () => {
      it('shows "Rozpocznij" label', () => {
        renderWithI18n(
          <QuizCard
            isShowStartText
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        const play = screen.getByRole("button", { name: "Rozpocznij quiz" });
        expect(within(play).getByText("Rozpocznij")).toBeInTheDocument();
      });

      it("uses primary filled styling when isMainAction is true", () => {
        renderWithI18n(
          <QuizCard
            isShowStartText
            isMainAction
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        const play = screen.getByRole("button", { name: "Rozpocznij quiz" });
        expect(play.className).toContain("bg-gi-primary");
        expect(play.className).toContain("text-white");
      });

      it("uses transparentized primary background when isMainAction is false", () => {
        renderWithI18n(
          <QuizCard
            isShowStartText
            description="Opis"
            tags={[]}
            onButtonClick={noop}
          />,
        );

        const play = screen.getByRole("button", { name: "Rozpocznij quiz" });
        expect(play.className).toContain("bg-gi-primary/10");
        expect(play.className).toContain("border-gi-primary");
        expect(play.className).toContain("text-gi-primary");
        expect(play.className).not.toContain("text-white");
      });
    });

    describe("when clicked", () => {
      it("calls onButtonClick", () => {
        const onButtonClick = vi.fn();
        renderWithI18n(
          <QuizCard
            description="Opis"
            tags={[]}
            onButtonClick={onButtonClick}
          />,
        );

        fireEvent.click(
          screen.getByRole("button", { name: "Rozpocznij quiz" }),
        );

        expect(onButtonClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("card click", () => {
    describe("when onCardClick is provided", () => {
      it("calls onCardClick when the card is clicked", () => {
        const onCardClick = vi.fn();
        renderWithI18n(
          <QuizCard
            description="Kliknij mnie"
            tags={[]}
            onButtonClick={noop}
            onCardClick={onCardClick}
          />,
        );

        fireEvent.click(screen.getByText("Kliknij mnie"));

        expect(onCardClick).toHaveBeenCalledTimes(1);
      });
    });
  });
});
