import { expect, type Page } from "@playwright/test";

// Opens an address and waits until the page stands still: the app has rendered
// its content and every font it uses has arrived. A web font that lands in the
// middle of a click reflows the page between press and release, and the click
// then misses its target.
export const openPage = async (page: Page, path: string) => {
  await page.goto(path);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("main")).not.toBeEmpty();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
};
