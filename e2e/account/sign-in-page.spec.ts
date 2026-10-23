import { expect, test } from "@playwright/test";

import { openPage } from "../layout/openPage";

// The app signs in through a stand-in until the API has accounts: it opens
// no provider window, waits a moment and answers as a provider would.
test.describe("Feature: The sign-in page", () => {
  test("Scenario: A visitor signs up on the sign-in page and goes on to where they came from", async ({
    page,
  }) => {
    await test.step("Given a signed-out visitor opens the sign-in page from the home page", async () => {
      await page.setViewportSize({ width: 360, height: 740 });
      await openPage(page, "/login?next=%2F%3Ffrom%3Dlogin");
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "Zaloguj się lub załóż konto",
        }),
      ).toBeVisible();
    });

    await test.step("When they continue with X and complete the last step", async () => {
      await page.getByRole("button", { name: "Kontynuuj z X" }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: "Prawie gotowe" }),
      ).toBeVisible();
      await page.getByRole("checkbox", { name: /16 lat/ }).click();
      await page.getByRole("checkbox", { name: /Akceptuję/ }).click();
      await page.getByRole("button", { name: "Gotowe" }).click();
    });

    await test.step("Then they land on the page they came from, signed in", async () => {
      await expect(page).toHaveURL(/\/\?from=login$/);

      await page.goto("/login");
      await expect(page).toHaveURL(/\/$/);
    });
  });
});
