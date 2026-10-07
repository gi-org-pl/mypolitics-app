import { expect, type Locator, type Page, test } from "@playwright/test";

import { openPage } from "../layout/openPage";

const HOME_PATH = "/";
const PROMOTION_NAME = "Dołącz na Discord Fundacji Generacja Innowacja";
const PROMOTION_ADDRESS = "https://discord.gg/5TqZZ57KhQ";
const FEATURED_QUIZ = "myPolitics";
const FEATURED_LEAD = "Najbardziej zaawansowany test poglądów politycznych.";
const BANNER_NAME = "Podgląd wyników quizu myPolitics";
const FEATURES = [
  "+4 000 000 osób",
  "Nikt nas nie finansuje",
  "Algorytm jest jawny",
];
const ALGORITHM_LINK = "Sprawdź jak działa algorytm.";
const WHITE_PAPER_ADDRESS = "https://mypolitics.pl/static/whitepaper.pdf";
const PARTNER_COUNT = 28;
const TAB_LIST_NAME = "Rodzaje quizów";
const ALL_TAB = "Wszystkie";
const ELECTORAL_TAB = "Wyborcze";
const SOCIAL_TAB = "Społecznościowe";
const ELECTORAL_QUIZZES = [
  "Wyborczy 2023",
  "Eurowyborczy 2024",
  "Warszawski Radar Wyborczy",
];
const SOCIAL_QUIZZES = [
  "Polskie Lata 90.",
  "600+ pytań",
  "Preferencje muzyczne",
  "Filozoficzny",
  "Kraje starożytne",
  "Orientacja seksualna",
];
const ALL_QUIZZES = [...ELECTORAL_QUIZZES, ...SOCIAL_QUIZZES];
const QUIZ_DESCRIPTION = "Poznaj najbliższych sobie warszawskich polityków!";
const WIDE_WINDOW = { width: 1280, height: 900 };
const NARROW_WINDOW = { width: 360, height: 740 };

// Opens the home page and waits for the pictures it displays as well: one
// that arrives late moves everything below it, and a click made at that moment
// misses. A picture that is not displayed at this width is never downloaded.
const openHomePage = async (page: Page) => {
  await openPage(page, HOME_PATH);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.images).every(
          (image) => image.complete || image.getClientRects().length === 0,
        ),
      ),
    )
    .toBe(true);
};

const getTab = (page: Page, name: string) =>
  page.getByRole("tablist", { name: TAB_LIST_NAME }).getByRole("tab", { name });

const getQuizCard = (page: Page, name: string): Locator =>
  page.getByRole("article").filter({
    has: page.getByRole("heading", { level: 2, name, exact: true }),
  });

const expectListedQuizzes = async (
  page: Page,
  tabName: string,
  quizzes: string[],
) => {
  const panel = page.getByRole("tabpanel", { name: tabName });

  await expect(panel.getByRole("article")).toHaveCount(quizzes.length);

  for (const name of quizzes) {
    await expect(
      panel.getByRole("heading", { level: 2, name, exact: true }),
    ).toBeVisible();
  }
};

test.describe("Feature: Home page", () => {
  test("Scenario: A visitor sees what the platform offers", async ({
    page,
  }) => {
    const main = page.getByRole("main");

    await test.step("Given a user opens the home page in a wide window", async () => {
      await page.setViewportSize(WIDE_WINDOW);
      await openHomePage(page);
    });

    await test.step("Then they see the promotion, which leads outside the app in a new tab", async () => {
      const promotion = main.getByRole("link", { name: PROMOTION_NAME });

      await expect(promotion).toBeVisible();
      await expect(promotion).toHaveAttribute("href", PROMOTION_ADDRESS);
      await expect(promotion).toHaveAttribute("target", "_blank");
    });

    await test.step("And the featured quiz once, with its start button and its description", async () => {
      const featured = getQuizCard(page, FEATURED_QUIZ);

      await expect(featured).toHaveCount(1);
      await expect(
        featured.getByRole("button", { name: "Rozpocznij quiz" }),
      ).toHaveText("Rozpocznij");
      await expect(featured.getByText(FEATURED_LEAD)).toBeVisible();
    });

    await test.step("And the preview of the featured quiz beside it", async () => {
      await expect(main.getByRole("img", { name: BANNER_NAME })).toBeVisible();
    });

    await test.step("And the three features of the platform, with the way to the algorithm", async () => {
      await expect(main.getByRole("heading", { level: 3 })).toHaveText(
        FEATURES,
      );
      await expect(
        main.getByRole("link", { name: ALGORITHM_LINK }),
      ).toHaveAttribute("href", WHITE_PAPER_ADDRESS);
    });

    await test.step("And the logos of the partners", async () => {
      const partners = main.getByRole("list").filter({
        has: page.getByRole("img", { name: "Stowarzyszenie Demagog" }),
      });

      await expect(partners.getByRole("img")).toHaveCount(PARTNER_COUNT);
    });

    await test.step("And every quiz under the tab of all quizzes, open without a toggle where it has no picture", async () => {
      await expect(getTab(page, ALL_TAB)).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expectListedQuizzes(page, ALL_TAB, ALL_QUIZZES);

      const logoCard = getQuizCard(page, ELECTORAL_QUIZZES[0]);

      await expect(logoCard.getByText(QUIZ_DESCRIPTION)).toBeVisible();
      await expect(
        logoCard.getByRole("button", { name: "Rozwiń" }),
      ).toBeHidden();
    });

    await test.step("And the actions for more quizzes and for an own quiz", async () => {
      await expect(
        main.getByRole("button", { name: "Zobacz więcej" }),
      ).toBeVisible();
      await expect(
        main.getByRole("button", { name: "Stwórz własny" }),
      ).toBeVisible();
    });
  });

  test("Scenario: A visitor filters the quizzes by kind", async ({ page }) => {
    await test.step("Given a user opens the home page", async () => {
      await page.setViewportSize(WIDE_WINDOW);
      await openHomePage(page);
      await expectListedQuizzes(page, ALL_TAB, ALL_QUIZZES);
    });

    await test.step("When they choose the electoral tab", async () => {
      await getTab(page, ELECTORAL_TAB).click();
    });

    await test.step("Then that tab is selected and only the electoral quizzes are listed", async () => {
      await expect(getTab(page, ELECTORAL_TAB)).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(getTab(page, ALL_TAB)).toHaveAttribute(
        "aria-selected",
        "false",
      );
      await expectListedQuizzes(page, ELECTORAL_TAB, ELECTORAL_QUIZZES);
    });

    await test.step("When they choose the social tab", async () => {
      await getTab(page, SOCIAL_TAB).click();
    });

    await test.step("Then only the social quizzes are listed", async () => {
      await expectListedQuizzes(page, SOCIAL_TAB, SOCIAL_QUIZZES);
    });

    await test.step("When they move back to the first tab with the keyboard", async () => {
      await getTab(page, SOCIAL_TAB).focus();
      await page.keyboard.press("Home");
    });

    await test.step("Then the tab of all quizzes has the focus and every quiz is listed again", async () => {
      await expect(getTab(page, ALL_TAB)).toBeFocused();
      await expect(getTab(page, ALL_TAB)).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expectListedQuizzes(page, ALL_TAB, ALL_QUIZZES);
    });

    await test.step("When they press the right arrow", async () => {
      await page.keyboard.press("ArrowRight");
    });

    await test.step("Then the electoral tab is selected and its quizzes are listed", async () => {
      await expect(getTab(page, ELECTORAL_TAB)).toBeFocused();
      await expectListedQuizzes(page, ELECTORAL_TAB, ELECTORAL_QUIZZES);
    });
  });

  test("Scenario: A visitor reads about a quiz in a narrow window", async ({
    page,
  }) => {
    const card = getQuizCard(page, ELECTORAL_QUIZZES[0]);

    await test.step("Given a user opens the home page in a narrow window", async () => {
      await page.setViewportSize(NARROW_WINDOW);
      await openHomePage(page);
    });

    await test.step("Then the page is as wide as the window", async () => {
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });

    await test.step("And they see the featured quiz once, without the separate preview", async () => {
      await expect(getQuizCard(page, FEATURED_QUIZ)).toHaveCount(1);
      await expect(
        getQuizCard(page, FEATURED_QUIZ).getByText(FEATURED_LEAD),
      ).toBeVisible();
      await expect(page.getByRole("img", { name: BANNER_NAME })).toBeHidden();
    });

    await test.step("And every quiz is listed, collapsed to its name", async () => {
      await expectListedQuizzes(page, ALL_TAB, ALL_QUIZZES);
      await expect(card.getByText(QUIZ_DESCRIPTION)).toBeHidden();
    });

    await test.step("When they expand a quiz", async () => {
      await card.getByRole("button", { name: "Rozwiń" }).click();
    });

    await test.step("Then they read its description and its tags", async () => {
      await expect(card.getByText(QUIZ_DESCRIPTION)).toBeVisible();
      await expect(card.getByRole("listitem")).toHaveText([
        "+40K osób",
        "9 min",
      ]);
    });

    await test.step("When they collapse it again", async () => {
      await card.getByRole("button", { name: "Zwiń" }).click();
    });

    await test.step("Then the description is hidden again", async () => {
      await expect(card.getByText(QUIZ_DESCRIPTION)).toBeHidden();
      await expect(
        card.getByRole("button", { name: "Rozwiń" }),
      ).toHaveAttribute("aria-expanded", "false");
    });
  });
});
