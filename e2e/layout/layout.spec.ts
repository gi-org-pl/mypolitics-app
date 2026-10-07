import { expect, type Page, test } from "@playwright/test";

const HOME_PATH = "/";
const UNKNOWN_PATH = "/nie-ma-takiej-strony";
const NAVIGATION_LINKS = ["Debaty", "Sondaże", "Quizy"];
const FOOTER_LINKS = ["Regulamin", "Prywatność", "O nas"];
const NOT_FOUND_HEADING = /To jest błąd 404/;
const TALL_WINDOW = { width: 1280, height: 1600 };
const LOW_WINDOW = { width: 1280, height: 320 };

const expectHeaderNavigation = async (page: Page) => {
  const navigation = page.getByRole("banner").getByRole("navigation");

  for (const name of NAVIGATION_LINKS) {
    await expect(navigation.getByRole("link", { name })).toBeVisible();
  }
};

const expectFooter = async (page: Page) => {
  const footer = page.getByRole("contentinfo");

  for (const name of FOOTER_LINKS) {
    await expect(footer.getByRole("link", { name })).toBeVisible();
  }
};

const getBox = async (page: Page, role: "main" | "contentinfo") => {
  const box = await page.getByRole(role).boundingBox();

  if (!box) {
    throw new Error(`The ${role} landmark is not rendered`);
  }

  return box;
};

test.describe("Feature: Application shell", () => {
  test("Scenario: The shell is on the home page", async ({ page }) => {
    await test.step("Given a user opens the home page", async () => {
      await page.goto(HOME_PATH);
    });

    await test.step("Then they see the header navigation", async () => {
      await expectHeaderNavigation(page);
    });

    await test.step("And they see the footer", async () => {
      await expectFooter(page);
    });
  });

  test("Scenario: The footer stays at the bottom of a short page", async ({
    page,
  }) => {
    await test.step("Given a user opens a page whose content is shorter than the window", async () => {
      await page.setViewportSize(TALL_WINDOW);
      await page.goto(UNKNOWN_PATH);
      await expect(
        page.getByRole("heading", { name: NOT_FOUND_HEADING }),
      ).toBeVisible();
    });

    await test.step("Then the footer ends at the bottom of the window", async () => {
      await expect(async () => {
        const footer = await getBox(page, "contentinfo");

        expect(footer.y + footer.height).toBeCloseTo(TALL_WINDOW.height, 0);
      }).toPass();
    });
  });

  test("Scenario: The footer follows the content of a long page", async ({
    page,
  }) => {
    await test.step("Given a user opens a page whose content is longer than the window", async () => {
      await page.setViewportSize(LOW_WINDOW);
      await page.goto(UNKNOWN_PATH);
      await expect(
        page.getByRole("heading", { name: NOT_FOUND_HEADING }),
      ).toBeVisible();
    });

    await test.step("Then the footer starts where the content ends, below the window", async () => {
      await expect(async () => {
        const main = await getBox(page, "main");
        const footer = await getBox(page, "contentinfo");

        expect(footer.y).toBeCloseTo(main.y + main.height, 0);
        expect(footer.y + footer.height).toBeGreaterThan(LOW_WINDOW.height);
      }).toPass();
    });

    await test.step("And the page scrolls as a whole down to the footer", async () => {
      await page.getByRole("contentinfo").scrollIntoViewIfNeeded();

      await expect(page.getByRole("contentinfo")).toBeInViewport();
    });
  });

  test("Scenario: An unknown address shows the not-found page inside the shell", async ({
    page,
  }) => {
    await test.step("Given a user opens an address that does not exist", async () => {
      await page.goto(UNKNOWN_PATH);
    });

    await test.step("Then they see the not-found page", async () => {
      await expect(
        page
          .getByRole("main")
          .getByRole("heading", { name: NOT_FOUND_HEADING }),
      ).toBeVisible();
    });

    await test.step("And they still see the header navigation and the footer", async () => {
      await expectHeaderNavigation(page);
      await expectFooter(page);
    });
  });
});
