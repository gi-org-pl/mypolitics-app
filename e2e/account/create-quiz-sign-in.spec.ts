import { expect, type Page, test } from "@playwright/test";

import { openPage } from "../layout/openPage";

// The app signs in through a stand-in until the API has accounts: it opens
// no provider window, waits a moment and answers as a provider would.
const CREATE = "Stwórz własny";
const DIALOG = "Najpierw zaloguj się";
const LINE = "Quiz zapiszemy na Twoim koncie. Pierwsze logowanie je zakłada.";

const openCreateDialog = async (page: Page) => {
  await openPage(page, "/");
  await page.getByRole("main").getByRole("button", { name: CREATE }).click();

  const dialog = page.getByRole("dialog", { name: DIALOG });
  await expect(dialog).toBeVisible();

  return dialog;
};

test.describe("Feature: Asking for an account before creating a quiz", () => {
  test('Scenario: A visitor signs up from "Stwórz własny"', async ({
    page,
  }) => {
    const dialog =
      await test.step("Given a signed-out visitor on the home page", async () => {
        await page.setViewportSize({ width: 1280, height: 900 });

        return test.step(`When they press "${CREATE}"`, () =>
          openCreateDialog(page));
      });

    await test.step(`Then a dialog says "${DIALOG}" and why`, async () => {
      await expect(dialog).toContainText(LINE);
    });

    await test.step("When they continue with Google and complete the last step", async () => {
      await dialog.getByRole("button", { name: "Kontynuuj z Google" }).click();
      await expect(
        dialog.getByRole("heading", { name: "Prawie gotowe" }),
      ).toBeVisible();
      await dialog.getByRole("checkbox", { name: /16 lat/ }).click();
      await dialog.getByRole("checkbox", { name: /Akceptuję/ }).click();
      await dialog.getByRole("button", { name: "Gotowe" }).click();
    });

    await test.step("Then the dialog closes, and creating asks for nothing more", async () => {
      await expect(dialog).toBeHidden();
      await page
        .getByRole("main")
        .getByRole("button", { name: CREATE })
        .click();
      await expect(page.getByRole("dialog")).toBeHidden();
    });
  });

  test("Scenario: A visitor closes the dialog", async ({ page }) => {
    const dialog =
      await test.step('Given the dialog opened from "Stwórz własny" on a phone', async () => {
        await page.setViewportSize({ width: 360, height: 740 });

        return openCreateDialog(page);
      });

    await test.step("When they press Escape", async () => {
      await page.keyboard.press("Escape");
    });

    await test.step("Then the dialog closes and the page is as before", async () => {
      await expect(dialog).toBeHidden();
      await expect(
        page.getByRole("main").getByRole("button", { name: CREATE }),
      ).toBeFocused();
    });
  });
});
