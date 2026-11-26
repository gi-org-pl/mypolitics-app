// Takes the migrated quiz from the home page to the result page, against the local mock API.
//   node e2e-run.mjs [width=1280] [pattern=mixed|agree|disagree]
// Needs: mock-api.mjs on :4010 and `yarn dev` on :5173 with VITE_API_URL=http://localhost:4010/api.

import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(
  new URL("../../../package.json", import.meta.url),
);
const { chromium } = require("playwright");
const here = new URL(".", import.meta.url).pathname;
const [W = "1280", pattern = "mixed"] = process.argv.slice(2);
const SLUG = "eurowyborczy2024";
const SHOTS = `${here}shots/`;
fs.mkdirSync(SHOTS, { recursive: true });

// answer buttons in a question, in order: za, częściowo za, częściowo przeciw, przeciw
const pick = (q) => {
  if (pattern === "agree") return 0;
  if (pattern === "disagree") return 3;
  return [0, 1, 0, 3, 1, 0, 2, 0, 1, 3][q % 10];
};

const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: +W, height: 900 } });
const errors = [];
const api = [];
page.on(
  "console",
  (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)),
);
page.on("pageerror", (e) =>
  errors.push(`pageerror ${String(e).slice(0, 200)}`),
);
page.on(
  "response",
  (r) =>
    r.url().includes(":4010") &&
    api.push(
      `${r.request().method()} ${new URL(r.url()).pathname} ${r.status()}`,
    ),
);

const text = async () =>
  (await page.innerText("main").catch(() => "")).replace(/\s+/g, " ");
try {
  await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });
  await page.goto(`http://localhost:5173/quizzes/${SLUG}`, {
    waitUntil: "domcontentloaded",
  });
  await page
    .getByRole("button", { name: "Idziemy dalej" })
    .waitFor({ timeout: 15000 });
  console.log("1 wybór kategorii:", (await text()).slice(0, 160));
  await page.screenshot({
    path: `${SHOTS}1-categories-${W}.png`,
    fullPage: true,
  });

  const cats = page
    .locator("main button:not([aria-label])")
    .filter({ hasNotText: /Idziemy|Pomiń/ });
  for (let i = 0; i < 3; i++) await cats.nth(i).click();
  await page.getByRole("button", { name: "Idziemy dalej" }).click();
  await page.waitForTimeout(800);

  let q = 0;
  for (let step = 0; step < 200; step++) {
    if (await page.getByRole("button", { name: "Zobacz wyniki" }).count())
      break;
    const group = page.locator("main [role=group]").first();
    if (await group.count()) {
      const buttons = group.getByRole("button");
      if (q === 0) {
        console.log(
          "2 pierwsze pytanie:",
          (await text()).slice(0, 200),
          "| odpowiedzi:",
          await buttons.count(),
        );
        await page.screenshot({
          path: `${SHOTS}2-question-${W}.png`,
          fullPage: true,
        });
      }
      await buttons.nth(Math.min(pick(q), (await buttons.count()) - 1)).click();
      q++;
      await page.waitForTimeout(700);
      continue;
    }
    const t = await text();
    if (/Wyłącz checkpointy/.test(t)) {
      console.log(`  checkpoint po pytaniu ${q}:`, t.slice(0, 120));
      const next = page.getByRole("button", { name: "Dalej", exact: true });
      if (await next.count()) await next.click();
      else {
        const opt = page
          .locator("main button")
          .filter({ hasNotText: /Poprzednie|Zacznij|Wyłącz|^Dalej$/ })
          .first();
        await opt.click();
        await page.waitForTimeout(1200);
        if (await next.count()) await next.click();
      }
      await page.waitForTimeout(800);
      continue;
    }
    console.log("nieznany stan po pytaniu", q, t.slice(0, 200));
    await page.screenshot({ path: `${SHOTS}unknown-${W}.png`, fullPage: true });
    break;
  }
  console.log("3 odpowiedziano na", q, "pytań");

  await page.screenshot({
    path: `${SHOTS}3-demographics-${W}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Pomiń", exact: true })
    .first()
    .click();
  await page.waitForTimeout(600);
  console.log("4 po demografii:", (await text()).slice(0, 140));

  await page.waitForURL(/\/results\//, { timeout: 45000 });
  console.log("5 URL wyniku:", page.url());
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: `${SHOTS}result-${pattern}-${W}.png`,
    fullPage: true,
  });
  console.log("6 wynik:", (await text()).slice(0, 600));
} catch (e) {
  console.log("BŁĄD:", String(e).slice(0, 300));
  await page
    .screenshot({ path: `${SHOTS}error-${W}.png`, fullPage: true })
    .catch(() => {});
} finally {
  console.log("API:", api.join(" | "));
  console.log("konsola:", errors.slice(0, 8));
  await browser.close();
}
