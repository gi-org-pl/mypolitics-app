import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, type Page, test } from "@playwright/test";

import { openPage } from "./openPage";

const HOME_PATH = "/";
const TERMS_PATH = "/terms";
const HOME_LINK_NAME = "Strona główna";
// Long enough for the whole animation, about 2 s, and its last frame.
const ANIMATION_MS = 2500;
const VISIT_KEY_PREFIX = "mypolitics:view-visited:";
const FRAME_MS = 100;

// The outlines of the logo the header rests on, read from the brand file.
const BRAND_PATHS = [
  ...readFileSync(
    path.resolve("src/assets/icons/mypolitics-primary-blue-on-light.svg"),
    "utf8",
  ).matchAll(/<path d="([^"]+)"/g),
].map(([, d]) => d);

const getLogo = (page: Page) =>
  page
    .getByRole("banner")
    .getByRole("link", { name: HOME_LINK_NAME })
    .locator("svg");

const getLogoPaths = (page: Page) =>
  getLogo(page)
    .locator("path")
    .evaluateAll((paths) => paths.map((p) => p.getAttribute("d")));

// Moves the clock a frame at a time until the sign moves. The app notes the
// visit after it has rendered, and that does not wait for the clock.
const expectLogoToMove = async (page: Page) => {
  await expect(async () => {
    await page.clock.runFor(FRAME_MS);
    await expect(getLogo(page)).toHaveAttribute("data-playing", "true", {
      timeout: FRAME_MS,
    });
  }).toPass();
};

// The clock of the page stands still until the scenario moves it, so a
// scenario sees the frames it asks for and not whichever came first.
const openWithStoppedClock = async (page: Page, address: string) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1000);
  await openPage(page, address);
};

test.describe("Feature: The header logo on the first visit of a view", () => {
  test("Scenario: The logo moves on the first visit of each view and rests after", async ({
    page,
  }) => {
    await test.step("Given a user opens the home page for the first time in the session", async () => {
      await openWithStoppedClock(page, HOME_PATH);
    });

    await test.step("Then the sign of the logo moves", async () => {
      await expectLogoToMove(page);
      await page.clock.runFor(FRAME_MS * 4);

      expect(await getLogoPaths(page)).not.toEqual(BRAND_PATHS);
    });

    await test.step("And it comes to rest on the blue logo", async () => {
      await page.clock.runFor(ANIMATION_MS);

      await expect(getLogo(page)).not.toHaveAttribute("data-playing");
      expect(await getLogoPaths(page)).toEqual(BRAND_PATHS);
    });

    await test.step("When they open the home page again in the same session", async () => {
      await page.reload();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    });

    await test.step("Then the logo rests from the start", async () => {
      for (let step = 0; step < 5; step += 1) {
        await page.clock.runFor(FRAME_MS);
        await expect(getLogo(page)).not.toHaveAttribute("data-playing");
      }
    });

    await test.step("When they go on to a view they have not seen", async () => {
      await page
        .getByRole("contentinfo")
        .getByRole("link", { name: "Regulamin" })
        .click();
      await expect(page).toHaveURL(TERMS_PATH);
    });

    await test.step("Then the logo moves again, once", async () => {
      await expectLogoToMove(page);

      await page.clock.runFor(ANIMATION_MS);
      await expect(getLogo(page)).not.toHaveAttribute("data-playing");
    });
  });

  test("Scenario: The logo does not move for a person who asked for less motion", async ({
    page,
  }) => {
    await test.step("Given a user who asked the system for reduced motion", async () => {
      await page.emulateMedia({ reducedMotion: "reduce" });
    });

    await test.step("When they open the home page for the first time in the session", async () => {
      await openWithStoppedClock(page, HOME_PATH);
    });

    await test.step("Then the blue logo rests from the start", async () => {
      // The visit is noted, so the app did decide about the animation.
      await expect
        .poll(() =>
          page.evaluate(
            (prefix) =>
              Object.keys(sessionStorage).some((key) => key.startsWith(prefix)),
            VISIT_KEY_PREFIX,
          ),
        )
        .toBe(true);

      for (let step = 0; step < 5; step += 1) {
        await page.clock.runFor(FRAME_MS);
        await expect(getLogo(page)).not.toHaveAttribute("data-playing");
      }

      expect(await getLogoPaths(page)).toEqual(BRAND_PATHS);
    });
  });
});
