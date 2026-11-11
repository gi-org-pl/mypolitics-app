import { expect, test } from "@playwright/test";

import { openPage } from "../layout/openPage";

// The app signs in through a stand-in until the API has accounts: it opens
// no provider window, waits a moment and answers as a provider would.
test.describe("Feature: The account in the header", () => {
  test("Scenario: A visitor signs in from the header, comes back and signs out", async ({
    page,
  }) => {
    const header = page.getByRole("banner");

    await test.step("Given a signed-out visitor on the home page", async () => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await openPage(page, "/?from=header");
    });

    await test.step('When they press "Zaloguj się" in the header', async () => {
      await header.getByRole("link", { name: "Zaloguj się" }).click();
    });

    await test.step("And continue with Facebook and complete the last step", async () => {
      await page
        .getByRole("button", { name: "Kontynuuj z Facebookiem" })
        .click();
      await expect(
        page.getByRole("heading", { level: 1, name: "Prawie gotowe" }),
      ).toBeVisible();
      await page.getByRole("checkbox", { name: /16 lat/ }).click();
      await page.getByRole("checkbox", { name: /Akceptuję/ }).click();
      await page.getByRole("button", { name: "Gotowe" }).click();
    });

    await test.step("Then they are back on the home page and the header shows their name", async () => {
      await expect(page).toHaveURL(/\/\?from=header$/);
      await expect(
        header.getByRole("button", { name: "Ala Nowak" }),
      ).toBeVisible();
    });

    await test.step("When they sign out from the account menu", async () => {
      await header.getByRole("button", { name: "Ala Nowak" }).click();
      await header.getByRole("button", { name: "Wyloguj się" }).click();
    });

    await test.step('Then the header offers "Zaloguj się" again', async () => {
      await expect(
        header.getByRole("link", { name: "Zaloguj się" }),
      ).toBeVisible();
    });
  });
});
