import { expect, type Locator, type Page, test } from "@playwright/test";

import { openPage } from "../layout/openPage";
import { mockSurveyApi } from "../survey/mockSurveyApi";
import { SURVEY_ID } from "../survey/survey.fixture";
import { mockResultRead, mockResultsApi } from "./mockResultsApi";
import {
  createResultResponse,
  FRIEND_RESULT_ID,
  LEADER_NAME,
  PARTIES_DESCRIPTION,
  RESULT_ID,
  RESULT_QUESTIONS,
  RESULT_QUIZ_NAME,
  resultSurveyFixture,
} from "./result.fixture";

const RESULT_PATH = `/results/${RESULT_ID}`;
const QUIZ_PATH = "/quizzes/mypolitics";
const NARROW_VIEWPORT = { width: 360, height: 800 };
// Longer than the stay of the loader, 6 seconds.
const LEAVE_TIMEOUT_MS = 20_000;

const getModule = (page: Page, name: string) =>
  page.getByRole("main").getByRole("region", { name, exact: true });

const getButton = (page: Page, name: string) =>
  page.getByRole("main").getByRole("button", { name, exact: true });

const getAgreementBar = (page: Page) =>
  page.getByRole("main").getByRole("region", { name: "Zgodność", exact: true });

const getModeTab = (page: Page, name: string) =>
  page
    .getByRole("tablist", { name: "Tryb porównania", exact: true })
    .getByRole("tab", { name, exact: true });

// The marks of the friend on the bars of a module.
const getFriendMarks = (page: Page, module: string) =>
  getModule(page, module).getByRole("img", { name: /porównanie z Znajomy/ });

const getFriendRequests = (requests: string[]) =>
  requests.filter((address) => address.includes(FRIEND_RESULT_ID));

const getBox = async (locator: Locator) => {
  const box = await locator.boundingBox();

  if (!box) throw new Error("The element is not drawn");

  return box;
};

const expectResult = async (page: Page) => {
  await expect(
    page.getByRole("heading", { level: 1, name: LEADER_NAME, exact: true }),
  ).toBeVisible();

  for (const name of ["Ideologie", "Tożsamość", "Partie"]) {
    await expect(getModule(page, name)).toBeVisible();
  }
};

const answer = async (
  page: Page,
  question: (typeof RESULT_QUESTIONS)[number],
  text: string,
) => {
  const answers = page.getByRole("group", { name: question.text });

  await expect(answers).toBeVisible();
  await answers.getByRole("button", { name: text, exact: true }).click();
};

test.describe("Feature: Results", () => {
  test("Scenario: A user opens the address of a calculated result", async ({
    page,
  }) => {
    const api = await mockResultsApi(page);

    await test.step("Given a calculated result of the identity quiz", async () => {
      // The mocked API holds the result and the quiz it names.
    });

    await test.step("When the user opens its address", async () => {
      await openPage(page, RESULT_PATH);
    });

    await test.step('Then they see the leading identity in the header and the modules "Ideologie", "Tożsamość" and "Partie"', async () => {
      await expectResult(page);
      await expect(page.getByText("90% pewności")).toBeVisible();
      await expect(
        getModule(page, "Partie").getByText("Zieloni"),
      ).toBeVisible();
      await expect(
        getModule(page, "Partie").getByText("Nowa Lewica"),
      ).toBeVisible();
      await expect(getModule(page, "Partie").getByText("Prawica")).toHaveCount(
        0,
      );
    });

    await test.step("And the name of the quiz stands under the modules and titles the document", async () => {
      await expect(
        page.getByRole("main").getByText(RESULT_QUIZ_NAME, { exact: true }),
      ).toBeVisible();
      await expect(page).toHaveTitle(RESULT_QUIZ_NAME);
    });

    await test.step("And the page asks search engines not to index it", async () => {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        "noindex",
      );
    });

    await test.step("And the result was asked for first, then the survey it names, and nothing else", async () => {
      expect(api.requests).toHaveLength(2);
      expect(api.requests[0]).toContain(`/v1/result/${RESULT_ID}`);
      expect(api.requests[1]).toContain(`/v1/survey/${SURVEY_ID}`);
      expect(api.requests[1]).toContain("lang=pl");
    });

    await test.step("And on a wide screen the modules stand in two columns of equal width, each by position", async () => {
      const ideologies = await getBox(getModule(page, "Ideologie"));
      const identity = await getBox(getModule(page, "Tożsamość"));
      const parties = await getBox(getModule(page, "Partie"));

      expect(identity.y).toBe(ideologies.y);
      expect(identity.x).toBeGreaterThan(ideologies.x + ideologies.width);
      expect(identity.width).toBe(ideologies.width);
      expect(parties.x).toBe(ideologies.x);
      expect(parties.y).toBeGreaterThan(ideologies.y + ideologies.height);
    });

    await test.step('When they use the info action of "Partie"', async () => {
      await getButton(page, "Informacje: Partie").click();
    });

    await test.step("Then a dialog shows the title and the description of the module", async () => {
      const dialog = page.getByRole("dialog", { name: "Partie" });

      await expect(dialog).toBeVisible();
      await expect(dialog.getByText(PARTIES_DESCRIPTION)).toBeVisible();
    });

    await test.step("When they close the dialog", async () => {
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Zamknij", exact: true })
        .click();
    });

    await test.step("Then the dialog is gone and the focus is back on the info action", async () => {
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(getButton(page, "Informacje: Partie")).toBeFocused();
    });

    await test.step("When the screen is narrow", async () => {
      await page.setViewportSize(NARROW_VIEWPORT);
    });

    await test.step("Then every module stands in one column, by position, with no sideways scroll", async () => {
      const ideologies = await getBox(getModule(page, "Ideologie"));
      const identity = await getBox(getModule(page, "Tożsamość"));
      const parties = await getBox(getModule(page, "Partie"));

      expect(identity.x).toBe(ideologies.x);
      expect(parties.x).toBe(ideologies.x);
      expect(identity.y).toBeGreaterThan(ideologies.y + ideologies.height);
      expect(parties.y).toBeGreaterThan(identity.y + identity.height);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });

    await test.step('When they choose the tab "Tryb porównania"', async () => {
      await page.getByRole("tab", { name: "Tryb porównania" }).click();
    });

    await test.step("Then they see the mode selector with their own result identifier, in place of the modules", async () => {
      const panel = page.getByRole("tabpanel", {
        name: "Tryb porównania",
        exact: true,
      });

      await expect(getModeTab(page, "Ze znajomym")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(panel.getByText(RESULT_ID, { exact: true })).toBeVisible();
      await expect(getModule(page, "Ideologie")).toHaveCount(0);
      await expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });
  });

  test("Scenario: A user compares their result with a friend's", async ({
    page,
  }) => {
    const api = await mockResultsApi(page);

    await test.step("Given a user is on their result and has a friend's result identifier of the same quiz", async () => {
      await openPage(page, RESULT_PATH);
      await expectResult(page);
    });

    await test.step('When they open "Tryb porównania" and paste it', async () => {
      await page
        .getByRole("tab", { name: "Tryb porównania", exact: true })
        .click();
      await page
        .getByRole("textbox", {
          name: "Identyfikator wyników znajomego",
          exact: true,
        })
        .fill(` ${FRIEND_RESULT_ID} `);
    });

    await test.step("Then they see the agreement bar: the friend, how much the two agree, and the way out", async () => {
      const bar = getAgreementBar(page);

      await expect(bar).toBeVisible();
      await expect(bar).toContainText("Zgodność — Znajomy");
      // The two chose the same answer of one question of two.
      await expect(
        bar.getByRole("img", { name: "Znajomy: 50%", exact: true }),
      ).toBeVisible();
      await expect(getButton(page, "Cofnij porównanie")).toBeVisible();
    });

    await test.step("And every module with the friend's marks", async () => {
      for (const name of ["Ideologie", "Tożsamość", "Partie"]) {
        await expect(getModule(page, name)).toBeVisible();
        await expect(getFriendMarks(page, name).first()).toBeVisible();
      }

      await expect(getFriendMarks(page, "Ideologie")).toHaveCount(2);
      // The parties stay the ones of the taker's identity, with the friend's
      // values for them.
      await expect(
        getModule(page, "Partie").getByRole("img", {
          name: "porównanie z Znajomy: 50%",
          exact: true,
        }),
      ).toBeVisible();
      await expect(getModule(page, "Partie").getByText("Prawica")).toHaveCount(
        0,
      );
    });

    await test.step("And the friend's result was asked for once, and is not in the address", async () => {
      expect(getFriendRequests(api.requests)).toHaveLength(1);
      await expect(page).toHaveURL(RESULT_PATH);
    });

    await test.step('When they go to "Twoje wyniki" and back', async () => {
      await page
        .getByRole("tab", { name: "Twoje wyniki", exact: true })
        .click();
      await expect(getFriendMarks(page, "Ideologie")).toHaveCount(0);
      await page
        .getByRole("tab", { name: "Tryb porównania", exact: true })
        .click();
    });

    await test.step("Then the comparison is still running, and nothing was asked for again", async () => {
      await expect(getAgreementBar(page)).toBeVisible();
      await expect(getFriendMarks(page, "Ideologie")).toHaveCount(2);
      expect(getFriendRequests(api.requests)).toHaveLength(1);
    });

    await test.step("When they end the comparison", async () => {
      await getButton(page, "Cofnij porównanie").click();
    });

    await test.step("Then they see the mode selector again, on the friend mode, with an empty field", async () => {
      await expect(getAgreementBar(page)).toHaveCount(0);
      await expect(getModeTab(page, "Ze znajomym")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(
        page.getByRole("textbox", {
          name: "Identyfikator wyników znajomego",
          exact: true,
        }),
      ).toHaveValue("");
    });
  });

  test("Scenario: A user compares their result with an orientation of the quiz", async ({
    page,
  }) => {
    const api = await mockResultsApi(page);

    await test.step("Given a user is on the comparison tab of their result", async () => {
      await openPage(page, RESULT_PATH);
      await expectResult(page);
      await page
        .getByRole("tab", { name: "Tryb porównania", exact: true })
        .click();
    });

    await test.step('When they choose "Z orientacją" and search for an orientation by name', async () => {
      await getModeTab(page, "Z orientacją").click();
      await page
        .getByRole("searchbox", { name: "Szukaj po nazwie", exact: true })
        .fill("INTER");
    });

    await test.step("Then the list is narrowed to it", async () => {
      await expect(page.getByRole("main").getByRole("listitem")).toHaveText([
        "Interwencjonizm",
      ]);
    });

    await test.step("When they pick it", async () => {
      await getButton(page, "Interwencjonizm").click();
    });

    await test.step("Then they see the agreement bar with the orientation and the score, and nothing was asked of the API", async () => {
      const bar = getAgreementBar(page);

      // The taker's answer lists the orientation in the one question whose
      // answers list it at all.
      await expect(
        bar.getByRole("img", { name: "Interwencjonizm: 100%", exact: true }),
      ).toBeVisible();
      await expect(getButton(page, "Cofnij porównanie")).toBeVisible();
      expect(api.requests).toHaveLength(2);
    });

    await test.step("When they end the comparison", async () => {
      await getButton(page, "Cofnij porównanie").click();
    });

    await test.step("Then they see the mode selector again, on the orientation mode", async () => {
      await expect(getModeTab(page, "Z orientacją")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(
        page.getByRole("searchbox", { name: "Szukaj po nazwie", exact: true }),
      ).toBeVisible();
    });
  });

  test("Scenario: A taker answers the last question of a quiz and reads the result in the app", async ({
    page,
  }) => {
    // The scenario waits out the stay of the loader.
    test.setTimeout(60_000);

    const api = await mockSurveyApi(page, resultSurveyFixture);

    // The result of a session is calculated as soon as it is stored.
    await mockResultRead(page, (resultId) =>
      api.results.some(
        (result) => (result as { sessionId: string }).sessionId === resultId,
      )
        ? createResultResponse(resultId)
        : undefined,
    );

    await test.step("Given a user answers the last question of a quiz", async () => {
      const [firstQuestion, lastQuestion] = RESULT_QUESTIONS;

      await openPage(page, QUIZ_PATH);
      await getButton(page, "Pomiń").click();
      await answer(page, firstQuestion, "Zdecydowanie za");
      await answer(page, lastQuestion, "Częściowo za");
    });

    await test.step("And they skip demographics and the e-mail card", async () => {
      await expect(
        page.getByRole("heading", { name: "Twoja tożsamość" }),
      ).toBeVisible();
      await getButton(page, "Pomiń").click();
      await expect(
        page.getByRole("heading", { name: "Zapisz swoje wyniki!" }),
      ).toBeVisible();
      await getButton(page, "Pomiń").click();
    });

    await test.step("When the result is calculated", async () => {
      await expect.poll(() => api.results).toHaveLength(1);
    });

    await test.step("Then they are on the result's address in the app", async () => {
      const { sessionId } = api.results[0] as { sessionId: string };

      await expect(page).toHaveURL(`/results/${sessionId}`, {
        timeout: LEAVE_TIMEOUT_MS,
      });
    });

    await test.step("And they see their result", async () => {
      await expectResult(page);
      await expect(page).toHaveTitle(RESULT_QUIZ_NAME);
    });

    await test.step("When they go back in the browser", async () => {
      await page.goBack();
    });

    await test.step("Then the quiz starts over with a new session", async () => {
      await expect(page).toHaveURL(QUIZ_PATH);
      await expect(
        page.getByRole("group", {
          name: "Wybierz 1 najważniejszy dla Ciebie temat.",
        }),
      ).toBeVisible();
      expect(api.results).toHaveLength(1);
    });
  });
});
